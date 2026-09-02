from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
import uuid
from .models import Assessment, AssessmentQuestion, AssessmentResponse, AssessmentResult
from .serializers import AssessmentSerializer, AssessmentResponseSerializer, AssessmentResultSerializer
from accounts.models import User

class AssessmentListView(generics.ListCreateAPIView):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), permissions.IsAdminUser()]

class AssessmentSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AssessmentResponseSerializer(data=request.data, many=True)
        if serializer.is_valid():
            assessment_id = request.data.get('assessment_id')
            employee_id = request.user.id

            if not assessment_id or not employee_id:
                return Response({"error": "Missing assessment or employee data"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                with transaction.atomic():
                    # 1. Save responses
                    responses = serializer.save()
                    for resp in responses:
                        resp.employee_id = employee_id
                        resp.save()

                    # 2. Calculate Final Score
                    total_score = 0
                    total_weight = 0
                    questions = AssessmentQuestion.objects.filter(assessment_id=assessment_id)

                    for q in questions:
                        resp = AssessmentResponse.objects.filter(question=q, employee_id=employee_id).first()
                        if resp:
                            total_score += (resp.response_value * q.weight)
                            total_weight += q.weight

                    final_score = total_score / total_weight if total_weight > 0 else 0

                    # Map score to level 1-5
                    calculated_level = 1
                    if final_score >= 90: calculated_level = 5
                    elif final_score >= 70: calculated_level = 4
                    elif final_score >= 50: calculated_level = 3
                    elif final_score >= 30: calculated_level = 2

                    # 3. Save Result
                    result = AssessmentResult.objects.create(
                        employee_id=employee_id,
                        assessment_id=assessment_id,
                        final_score=final_score,
                        calculated_level=calculated_level,
                        assessor=request.user
                    )

                    return Response({
                        "status": "success",
                        "result_id": result.id,
                        "final_score": final_score,
                        "level": calculated_level
                    }, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AssessmentResultsView(generics.ListAPIView):
    serializer_class = AssessmentResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        employee_id = self.kwargs['employee_id']
        user = self.request.user

        # RBAC: Only HR, Admin, Supervisor or the Employee themselves
        if user.is_superuser or user.is_staff or user.roles.filter(role_name__in=['ADMIN', 'HR_MANAGER']).exists():
            return AssessmentResult.objects.filter(employee_id=employee_id)

        try:
            target_uuid = uuid.UUID(str(employee_id))
            if user.id == target_uuid:
                return AssessmentResult.objects.filter(employee_id=employee_id)

            target_user = User.objects.filter(id=target_uuid).first()
            if target_user and target_user.supervisor == user:
                return AssessmentResult.objects.filter(employee_id=employee_id)
        except Exception:
            pass

        return AssessmentResult.objects.none()

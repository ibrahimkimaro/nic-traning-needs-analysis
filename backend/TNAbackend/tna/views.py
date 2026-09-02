from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.utils import timezone
from .models import TrainingRequest, TrainingRequestApproval, ApprovalDelegate, Attachment
from .serializers import (
    TrainingRequestSerializer, TrainingRequestCreateSerializer,
    ApprovalActionSerializer, AttachmentSerializer
)
from accounts.models import User, Role, Department
from competencies.models import PositionCompetency
from assessments.models import AssessmentResult
from training.models import TrainingProgram, TrainingCompetency

class IsRequestOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.employee == request.user

class TrainingRequestListView(generics.ListAPIView):
    serializer_class = TrainingRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Admin/HR see all
        if user.is_superuser or user.is_staff or user.roles.filter(role_name__in=['ADMIN', 'HR_MANAGER']).exists():
            return TrainingRequest.objects.all()

        # Supervisors see their team's requests
        if user.roles.filter(role_name='DEPT_HEAD').exists():
            return TrainingRequest.objects.filter(employee__supervisor=user)

        return TrainingRequest.objects.filter(employee=user)

class TrainingRequestDetailView(generics.RetrieveAPIView):
    serializer_class = TrainingRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TrainingRequest.objects.all()

class TrainingRequestCreateView(generics.CreateAPIView):
    serializer_class = TrainingRequestCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        employee = user

        # Determine Approver Logic
        approver = None
        supervisor = employee.supervisor

        if supervisor:
            # Check for active delegate
            today = timezone.now().date()
            delegate = ApprovalDelegate.objects.filter(
                primary_approver=supervisor,
                start_date__lte=today,
                end_date__gte=today,
                is_active=True
            ).first()

            approver = delegate.delegate_approver if delegate else supervisor

        # Fallback to HR if no supervisor/delegate
        if not approver:
            approver = User.objects.filter(roles__role_name='HR_MANAGER').first()

        serializer.save(
            employee=employee,
            current_approver=approver,
            status='PENDING_DEPT' if approver and not approver.roles.filter(role_name='HR_MANAGER').exists() else 'HR_REVIEW'
        )

class TrainingRequestApprovalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            training_request = TrainingRequest.objects.get(pk=pk)
        except TrainingRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=status.HTTP_404_NOT_FOUND)

        # RBAC: Only current approver or Admin can act
        if training_request.current_approver != request.user and not request.user.is_superuser:
            return Response({"error": "You are not the current approver"}, status=status.HTTP_403_FORBIDDEN)

        serializer = ApprovalActionSerializer(data=request.data)
        if serializer.is_valid():
            action = serializer.data['action']
            comments = serializer.data.get('comments', '')

            with transaction.atomic():
                # Record approval action
                TrainingRequestApproval.objects.create(
                    request=training_request,
                    approver=request.user,
                    action=action,
                    comments=comments
                )

                # Update Status
                if action == 'APPROVED':
                    if training_request.status == 'PENDING_DEPT':
                        if training_request.estimated_cost > 500000:
                            training_request.status = 'PENDING_BUDGET'
                            training_request.current_approver = User.objects.filter(roles__role_name='FINANCE').first()
                        else:
                            training_request.status = 'HR_REVIEW'
                            training_request.current_approver = User.objects.filter(roles__role_name='HR_MANAGER').first()
                    elif training_request.status == 'PENDING_BUDGET':
                        training_request.status = 'HR_REVIEW'
                        training_request.current_approver = User.objects.filter(roles__role_name='HR_MANAGER').first()
                    else:
                        training_request.status = 'APPROVED'
                        training_request.current_approver = None

                elif action == 'REJECTED':
                    training_request.status = 'REJECTED'
                    training_request.current_approver = None

                elif action == 'CHANGES_REQUESTED':
                    training_request.status = 'CHANGES_REQUESTED'
                    training_request.current_approver = None

                training_request.save()
                return Response({"status": "success", "new_status": training_request.status}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TrainingRequestAttachmentView(generics.CreateAPIView):
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        request_id = self.kwargs.get('pk')
        training_request = TrainingRequest.objects.get(pk=request_id)

        # Only requesting user can attach files
        if training_request.employee != self.request.user and not self.request.user.is_superuser:
            raise permissions.PermissionDenied("Only the requesting employee can add attachments.")

        serializer.save(request=training_request)

# --- TNA ANALYSIS ENGINE ---

class GapAnalysisView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, employee_id):
        user = request.user
        # RBAC check
        if not (user.is_superuser or user.is_staff or user.roles.filter(role_name__in=['ADMIN', 'HR_MANAGER']).exists() or
                str(user.id) == str(employee_id)):
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        try:
            employee = User.objects.get(id=employee_id)
        except User.DoesNotExist:
            return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)

        position = employee.position
        requirements = PositionCompetency.objects.filter(position=position) if position else []

        gaps = []
        for req in requirements:
            result = AssessmentResult.objects.filter(
                employee=employee,
                assessment__questions__competency=req.competency
            ).order_by('-completed_at').first()

            current_level = result.calculated_level if result else 1
            gap = req.required_level - current_level

            gaps.append({
                "competency": req.competency.name,
                "required": req.required_level,
                "current": current_level,
                "gap": max(0, gap),
                "priority": req.importance
            })

        return Response({"employee": employee.get_full_name(), "gaps": gaps})

class TrainingRecommendationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, employee_id):
        try:
            employee = User.objects.get(id=employee_id)
        except User.DoesNotExist:
            return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)

        position = employee.position
        requirements = PositionCompetency.objects.filter(position=position) if position else []

        recommendations = []
        for req in requirements:
            result = AssessmentResult.objects.filter(
                employee=employee,
                assessment__questions__competency=req.competency
            ).order_by('-completed_at').first()

            current_level = result.calculated_level if result else 1
            if req.required_level > current_level:
                programs = TrainingProgram.objects.filter(addressed_competencies__competency=req.competency)
                for p in programs:
                    recommendations.append({
                        "program": p.title,
                        "competency": req.competency.name,
                        "gap": req.required_level - current_level,
                        "provider": p.provider.provider_name if p.provider else "Internal"
                    })

        return Response({"recommendations": recommendations})

class DepartmentSkillMatrixView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, department_id):
        if not (request.user.is_superuser or request.user.is_staff or request.user.roles.filter(role_name__in=['ADMIN', 'HR_MANAGER']).exists()):
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        try:
            dept = Department.objects.get(id=department_id)
        except Department.DoesNotExist:
            return Response({"error": "Department not found"}, status=status.HTTP_404_NOT_FOUND)

        employees = User.objects.filter(dept=dept)

        matrix = {}
        for emp in employees:
            emp_gaps = []
            position = emp.position
            requirements = PositionCompetency.objects.filter(position=position) if position else []
            for req in requirements:
                result = AssessmentResult.objects.filter(
                    employee=emp,
                    assessment__questions__competency=req.competency
                ).order_by('-completed_at').first()
                current_level = result.calculated_level if result else 1
                emp_gaps.append({
                    "competency": req.competency.name,
                    "gap": max(0, req.required_level - current_level)
                })
            matrix[str(emp.id)] = {
                "name": emp.get_full_name(),
                "gaps": emp_gaps
            }

        return Response({"department": dept.dept_name, "matrix": matrix})

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import TrainingProvider, TrainingProgram, TrainingEnrollment, TrainingEvaluation
from .serializers import (
    TrainingProviderSerializer, TrainingProgramSerializer,
    TrainingEnrollmentSerializer, TrainingEvaluationSerializer
)

class TrainingProviderListView(generics.ListCreateAPIView):
    queryset = TrainingProvider.objects.all()
    serializer_class = TrainingProviderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), permissions.IsAdminUser()]

class TrainingProgramListView(generics.ListCreateAPIView):
    queryset = TrainingProgram.objects.all()
    serializer_class = TrainingProgramSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), permissions.IsAdminUser()]

class TrainingEnrollmentView(generics.ListCreateAPIView):
    serializer_class = TrainingEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.is_staff or user.roles.filter(role_name__in=['ADMIN', 'HR_MANAGER']).exists():
            return TrainingEnrollment.objects.all()

        return TrainingEnrollment.objects.filter(employee=user)

class TrainingEvaluationSubmitView(generics.CreateAPIView):
    serializer_class = TrainingEvaluationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()

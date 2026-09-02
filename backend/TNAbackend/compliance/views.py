from rest_framework import generics, permissions
from .models import ComplianceRequirement, EmployeeCertification
from .serializers import ComplianceRequirementSerializer, EmployeeCertificationSerializer

class ComplianceRequirementListView(generics.ListAPIView):
    queryset = ComplianceRequirement.objects.all()
    serializer_class = ComplianceRequirementSerializer
    permission_classes = [permissions.IsAuthenticated]

class EmployeeCertificationListView(generics.ListAPIView):
    serializer_class = EmployeeCertificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # HR, Admin can see all certifications
        if user.is_superuser or user.is_staff or user.roles.filter(role_name__in=['ADMIN', 'HR_MANAGER']).exists():
            return EmployeeCertification.objects.all()

        # Employees can only see their own
        return EmployeeCertification.objects.filter(employee=user)

class ExpiringCertificationsView(generics.ListAPIView):
    serializer_class = EmployeeCertificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from django.utils import timezone
        from datetime import timedelta

        # Only HR/Admin can see expiring reports
        if not (self.request.user.is_superuser or self.request.user.is_staff or self.request.user.roles.filter(role_name__in=['ADMIN', 'HR_MANAGER']).exists()):
            return EmployeeCertification.objects.none()

        thirty_days_from_now = timezone.now().date() + timedelta(days=30)
        return EmployeeCertification.objects.filter(expiry_date__lte=thirty_days_from_now)

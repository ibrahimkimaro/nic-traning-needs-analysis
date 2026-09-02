from django.urls import path
from .views import ComplianceRequirementListView, EmployeeCertificationListView, ExpiringCertificationsView

urlpatterns = [
    path('requirements/', ComplianceRequirementListView.as_view(), name='compliance-req-list'),
    path('certifications/', EmployeeCertificationListView.as_view(), name='certification-list'),
    path('expiring/', ExpiringCertificationsView.as_view(), name='cert-expiring'),
]

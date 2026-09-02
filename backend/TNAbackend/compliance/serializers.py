from rest_framework import serializers
from compliance.models import ComplianceRequirement, EmployeeCertification

class ComplianceRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplianceRequirement
        fields = ['id', 'competency', 'program', 'validity_months', 'requirement_name']

class EmployeeCertificationSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.get_full_name')
    requirement_name = serializers.ReadOnlyField(source='requirement.requirement_name')

    class Meta:
        model = EmployeeCertification
        fields = ['id', 'employee', 'employee_name', 'requirement', 'requirement_name', 'issue_date', 'expiry_date', 'certificate_url']

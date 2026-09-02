from django.db import models
import uuid
from core.models import TimeStampedModel
from accounts.models import User
from budget.models import ComplianceRequirement

class EmployeeCertification(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certifications')
    requirement = models.ForeignKey(ComplianceRequirement, on_delete=models.CASCADE)
    issue_date = models.DateField()
    expiry_date = models.DateField()
    certificate_url = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return f"{self.employee} - {self.requirement.requirement_name}"

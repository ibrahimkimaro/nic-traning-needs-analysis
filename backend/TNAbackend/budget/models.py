from django.db import models
import uuid
from core.models import TimeStampedModel
from accounts.models import Department
from tna.models import TrainingRequest
from competencies.models import Competency
from training.models import TrainingProgram

class Budget(TimeStampedModel):
    dept = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='budgets')
    fiscal_year = models.IntegerField()
    total_amount = models.DecimalField(max_digits=15, decimal_places=2)
    spent_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    class Meta:
        unique_together = ('dept', 'fiscal_year')

    def __str__(self):
        return f"Budget {self.fiscal_year} - {self.dept.dept_name}"

class TrainingCost(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.OneToOneField(TrainingRequest, on_delete=models.CASCADE, related_name='cost_details')
    estimated_amount = models.DecimalField(max_digits=12, decimal_places=2)
    actual_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    payment_date = models.DateField(null=True, blank=True)

class ComplianceRequirement(TimeStampedModel):
    competency = models.ForeignKey(Competency, on_delete=models.CASCADE, null=True, blank=True)
    program = models.ForeignKey(TrainingProgram, on_delete=models.CASCADE, null=True, blank=True)
    validity_months = models.IntegerField()
    requirement_name = models.CharField(max_length=255)

    def __str__(self):
        return self.requirement_name

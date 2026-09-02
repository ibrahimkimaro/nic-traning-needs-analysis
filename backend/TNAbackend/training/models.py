from django.db import models
import uuid
from core.models import TimeStampedModel
from accounts.models import User
from competencies.models import Competency

class TrainingProvider(TimeStampedModel):
    provider_name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    rating = models.IntegerField(default=0) # 1-5

    def __str__(self):
        return self.provider_name

class TrainingProgram(TimeStampedModel):
    title = models.CharField(max_length=255)
    description = models.TextField()
    duration_hours = models.IntegerField(null=True, blank=True)
    provider = models.ForeignKey(TrainingProvider, on_delete=models.SET_NULL, null=True, blank=True, related_name='programs')
    cost_per_person = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return self.title

class TrainingCompetency(TimeStampedModel):
    program = models.ForeignKey(TrainingProgram, on_delete=models.CASCADE, related_name='addressed_competencies')
    competency = models.ForeignKey(Competency, on_delete=models.CASCADE, related_name='training_programs')
    impact_level = models.IntegerField(default=1) # 1-5

    class Meta:
        unique_together = ('program', 'competency')

class TrainingEnrollment(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program = models.ForeignKey(TrainingProgram, on_delete=models.CASCADE, related_name='enrollments')
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    enrollment_date = models.DateField(auto_now_add=True)
    completion_status = models.CharField(max_length=20, default='ENROLLED', choices=[
        ('ENROLLED', 'Enrolled'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('WITHDRAWN', 'Withdrawn'),
    ])

    def __str__(self):
        return f"{self.employee} enrolled in {self.program}"

class TrainingEvaluation(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enrollment = models.OneToOneField(TrainingEnrollment, on_delete=models.CASCADE, related_name='evaluation')
    level_1_score = models.IntegerField(null=True, blank=True) # Reaction (1-5)
    level_1_comments = models.TextField(blank=True, null=True)
    level_2_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True) # Learning
    level_3_rating = models.IntegerField(null=True, blank=True) # Behavior (1-5)
    level_4_impact = models.TextField(blank=True, null=True) # Results
    evaluated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Evaluation for {self.enrollment}"

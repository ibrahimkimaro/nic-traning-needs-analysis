from django.db import models
import uuid
from core.models import TimeStampedModel
from accounts.models import User
from competencies.models import Competency

class Assessment(TimeStampedModel):
    title = models.CharField(max_length=255)
    version = models.CharField(max_length=10, blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.title} (v{self.version})"

class AssessmentQuestion(TimeStampedModel):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='questions')
    competency = models.ForeignKey(Competency, on_delete=models.CASCADE)
    question_text = models.TextField()
    weight = models.DecimalField(max_digits=3, decimal_places=2, default=1.0)

    def __str__(self):
        return f"Q: {self.question_text[:50]}..."

class AssessmentResponse(TimeStampedModel):
    question = models.ForeignKey(AssessmentQuestion, on_delete=models.CASCADE)
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assessment_responses')
    response_value = models.IntegerField() # Numeric score for the question

    class Meta:
        unique_together = ('question', 'employee')

class AssessmentResult(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assessment_results')
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    final_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    calculated_level = models.IntegerField(null=True, blank=True) # 1-5
    assessor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    completed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Result for {self.employee} - {self.assessment}"

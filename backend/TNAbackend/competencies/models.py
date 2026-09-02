from django.db import models
from core.models import TimeStampedModel
from accounts.models import Position

class Competency(TimeStampedModel):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    is_mandatory = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.code} - {self.name}"

class PositionCompetency(TimeStampedModel):
    position = models.ForeignKey(Position, on_delete=models.CASCADE, related_name='required_competencies')
    competency = models.ForeignKey(Competency, on_delete=models.CASCADE, related_name='position_requirements')
    required_level = models.IntegerField() # 1-5
    importance = models.CharField(max_length=20, choices=[('HIGH', 'High'), ('MEDIUM', 'Medium'), ('LOW', 'Low')], default='MEDIUM')

    class Meta:
        unique_together = ('position', 'competency')

    def __str__(self):
        return f"{self.position} requires {self.competency} (Level {self.required_level})"

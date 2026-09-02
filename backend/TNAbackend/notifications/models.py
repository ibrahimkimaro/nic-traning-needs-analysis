from django.db import models
import uuid
from core.models import TimeStampedModel
from accounts.models import User

class Notification(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    channel = models.CharField(max_length=20, choices=[('EMAIL', 'Email'), ('SMS', 'SMS')])
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='SENT', choices=[('SENT', 'Sent'), ('FAILED', 'Failed'), ('DELIVERED', 'Delivered')])

    def __str__(self):
        return f"Notification to {self.user} via {self.channel}"

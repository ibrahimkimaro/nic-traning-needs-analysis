from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'channel', 'message', 'sent_at', 'status', 'is_read', 'created_at']
        read_only_fields = ['id', 'sent_at', 'created_at']

from rest_framework import serializers
from tna.models import TrainingRequest, TrainingRequestApproval, ApprovalDelegate, Attachment
from accounts.models import User

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'file', 'file_name', 'file_type', 'uploaded_at']

class TrainingRequestApprovalSerializer(serializers.ModelSerializer):
    approver_name = serializers.ReadOnlyField(source='approver.get_full_name')

    class Meta:
        model = TrainingRequestApproval
        fields = ['id', 'approver', 'approver_name', 'action', 'comments', 'action_date']

class TrainingRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.get_full_name')
    approvals = TrainingRequestApprovalSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    current_approver_name = serializers.ReadOnlyField(source='current_approver.username')

    class Meta:
        model = TrainingRequest
        fields = [
            'id', 'employee', 'employee_name', 'title', 'reason', 'desired_outcome',
            'status', 'estimated_cost', 'current_approver', 'current_approver_name',
            'approvals', 'attachments'
        ]
        read_only_fields = ['status', 'current_approver', 'current_approver_name']

class TrainingRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingRequest
        fields = ['title', 'reason', 'desired_outcome', 'estimated_cost']

class ApprovalActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingRequestApproval
        fields = ['action', 'comments']

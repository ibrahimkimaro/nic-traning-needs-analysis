from rest_framework import serializers
from pathlib import Path
from tna.models import TrainingRequest, TrainingRequestApproval, ApprovalDelegate, Attachment
from accounts.models import User

class AttachmentSerializer(serializers.ModelSerializer):
    MAX_FILE_SIZE = 20 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'}

    class Meta:
        model = Attachment
        fields = [
            'id', 'file', 'file_name', 'file_type', 'document_type',
            'uploaded_by', 'approval_status', 'created_at',
        ]
        read_only_fields = ['id', 'file_name', 'file_type', 'uploaded_by', 'approval_status', 'created_at']

    def validate_file(self, value):
        extension = Path(value.name).suffix.lower()
        if extension not in self.ALLOWED_EXTENSIONS:
            allowed = ', '.join(sorted(self.ALLOWED_EXTENSIONS))
            raise serializers.ValidationError(f'Unsupported file type. Allowed types: {allowed}.')
        if value.size > self.MAX_FILE_SIZE:
            raise serializers.ValidationError('File size must not exceed 20 MB.')
        return value

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
            'status', 'estimated_cost', 'start_date', 'end_date', 'training_place', 'current_approver', 'current_approver_name',
            'approvals', 'attachments','created_at', 'updated_at'
        ]
        read_only_fields = ['status', 'current_approver', 'current_approver_name']

class TrainingRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingRequest
        fields = ['title', 'reason', 'desired_outcome', 'estimated_cost','start_date','end_date','training_place']

class ApprovalActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingRequestApproval
        fields = ['action', 'comments']

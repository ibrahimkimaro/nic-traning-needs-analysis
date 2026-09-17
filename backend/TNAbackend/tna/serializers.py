from rest_framework import serializers
from pathlib import Path
from django.db import transaction
from tna.models import (
    TrainingRequest, TrainingRequestItem, TrainingRequestApproval,
    ApprovalDelegate, Attachment, TrainingRequestComment, TrainingRequestParticipantResponse
)
from accounts.models import User


class AttachmentSerializer(serializers.ModelSerializer):
    MAX_FILE_SIZE = 20 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'}

    class Meta:
        model = Attachment
        fields = [
            'id', 'request', 'item', 'file', 'file_name', 'file_type', 'document_type',
            'uploaded_by', 'approval_status', 'created_at',
        ]
        read_only_fields = ['id', 'request', 'item', 'file_name', 'file_type', 'uploaded_by', 'approval_status', 'created_at']

    def validate_file(self, value):
        extension = Path(value.name).suffix.lower()
        if extension not in self.ALLOWED_EXTENSIONS:
            allowed = ', '.join(sorted(self.ALLOWED_EXTENSIONS))
            raise serializers.ValidationError(f'Unsupported file type. Allowed types: {allowed}.')
        if value.size > self.MAX_FILE_SIZE:
            raise serializers.ValidationError('File size must not exceed 20 MB.')
        return value

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.file:
            request = self.context.get('request')
            if request:
                ret['file'] = request.build_absolute_uri(instance.file.url)
            else:
                ret['file'] = instance.file.url
        return ret


class TrainingRequestApprovalSerializer(serializers.ModelSerializer):
    approver_name = serializers.ReadOnlyField(source='approver.get_full_name')

    class Meta:
        model = TrainingRequestApproval
        fields = ['id', 'approver', 'approver_name', 'action', 'comments', 'action_date']


class TrainingRequestItemSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = TrainingRequestItem
        fields = [
            'id', 'title', 'justification', 'desired_outcome',
            'is_selected', 'status', 'planned_year', 'planned_month',
            'training_place', 'estimated_cost', 'attachments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TrainingRequestItemCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    justification = serializers.CharField()
    desired_outcome = serializers.CharField()

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be blank.")
        return value.strip()

    def validate_justification(self, value):
        if not value.strip():
            raise serializers.ValidationError("Justification cannot be blank.")
        return value.strip()

    def validate_desired_outcome(self, value):
        if not value.strip():
            raise serializers.ValidationError("Desired outcome cannot be blank.")
        return value.strip()


class TrainingRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.get_full_name')
    employee_dept = serializers.ReadOnlyField(source='employee.dept.dept_name')
    recipient_name = serializers.ReadOnlyField(source='recipient.get_full_name')
    current_approver_name = serializers.ReadOnlyField(source='current_approver.get_full_name')
    items = TrainingRequestItemSerializer(many=True, read_only=True)
    approvals = TrainingRequestApprovalSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = TrainingRequest
        fields = [
            'id', 'employee', 'employee_name', 'employee_dept', 'recipient', 'recipient_name',
            'status', 'current_approver', 'current_approver_name',
            'title', 'reason', 'desired_outcome', 'estimated_cost',
            'start_date', 'end_date', 'training_place',
            'eligibility_verified', 'budget_line_item', 'is_anonymized', 'anonymized_reference',
            'logistics_vendor', 'logistics_venue', 'logistics_dates', 'calendar_invites_sent',
            'items', 'approvals', 'attachments',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['status', 'current_approver', 'current_approver_name', 'created_at', 'updated_at']


class TrainingRequestCreateSerializer(serializers.ModelSerializer):
    recipient = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )
    items = TrainingRequestItemCreateSerializer(many=True, required=True)

    class Meta:
        model = TrainingRequest
        fields = ['recipient', 'items']

    def validate_items(self, value):
        if not value or len(value) < 1:
            raise serializers.ValidationError("At least one training need item must be provided.")
        if len(value) > 3:
            raise serializers.ValidationError("You cannot submit more than 3 training needs in one request.")
        return value

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        request_obj = self.context.get('request')
        employee = validated_data.pop('employee', None) or (request_obj.user if request_obj else None)

        recipient = validated_data.pop('recipient', None)
        if not recipient and employee:
            # Fallback to supervisor or department head
            if employee.supervisor:
                recipient = employee.supervisor
            elif employee.dept and employee.dept.head:
                recipient = employee.dept.head

        current_approver = validated_data.pop('current_approver', recipient)
        req_status = validated_data.pop('status', 'SUBMITTED')

        with transaction.atomic():
            first_item = items_data[0]
            training_request = TrainingRequest.objects.create(
                employee=employee,
                recipient=recipient,
                current_approver=current_approver,
                status=req_status,
                title=first_item['title'],
                reason=first_item['justification'],
                desired_outcome=first_item['desired_outcome'],
                **validated_data
            )

            for item_data in items_data:
                TrainingRequestItem.objects.create(
                    request=training_request,
                    title=item_data['title'],
                    justification=item_data['justification'],
                    desired_outcome=item_data['desired_outcome']
                )

        return training_request

    def to_representation(self, instance):
        return TrainingRequestSerializer(instance, context=self.context).data


class ItemNominationSerializer(serializers.Serializer):
    item_id = serializers.UUIDField()
    is_selected = serializers.BooleanField(default=True)
    planned_year = serializers.IntegerField(required=False, allow_null=True)
    planned_month = serializers.IntegerField(required=False, allow_null=True, min_value=1, max_value=12)
    training_place = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    estimated_cost = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)


class ApprovalActionSerializer(serializers.Serializer):
    action = serializers.CharField(max_length=30)
    comments = serializers.CharField(required=False, allow_blank=True)
    selected_item_ids = serializers.ListField(child=serializers.UUIDField(), required=False)
    item_nominations = ItemNominationSerializer(many=True, required=False)

    # HRO Administrative Verification & Anonymization
    eligibility_verified = serializers.BooleanField(required=False)
    budget_line_item = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    is_anonymized = serializers.BooleanField(required=False)
    anonymized_reference = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    # Logistics Fulfillment
    logistics_vendor = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    logistics_venue = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    logistics_dates = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    calendar_invites_sent = serializers.BooleanField(required=False)

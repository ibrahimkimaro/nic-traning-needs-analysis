from django.db import models
import uuid
from core.models import TimeStampedModel
from accounts.models import User

class TrainingRequest(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='training_requests')
    title = models.CharField(max_length=255)
    reason = models.TextField()
    desired_outcome = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=30, default='ATTACHMENT_WAIT', choices=[
        ('ATTACHMENT_WAIT','waiting attachment'),
        ('SUBMITTED', 'Submitted'),
        ('PENDING_DEPT', 'Pending Department Approval'),
        ('PENDING_BUDGET', 'Pending Budget Approval'),
        ('DEPARTMENT_APPROVED', 'Department Approved'),
        ('BUDGET_APPROVED', 'Budget Approved'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('CHANGES_REQUESTED', 'Changes Requested'),
    ])
    estimated_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    start_date = models.DateField(null=True,blank=True)
    end_date = models.DateField(null=True,blank=True)
    training_place = models.CharField(max_length=255,help_text="Physical location or online training platform",null=True)
    current_approver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='pending_approvals')
    create_at =  models.DateTimeField(auto_now_add=True,null=True,blank=True)
    updated_at =  models.DateTimeField(auto_now=True,null=True,blank=True)

    def __str__(self):
        return f"Request {self.id} - {self.title}"

class TrainingRequestApproval(TimeStampedModel):
    request = models.ForeignKey(TrainingRequest, on_delete=models.CASCADE, related_name='approvals')
    approver = models.ForeignKey(User, on_delete=models.PROTECT)
    action = models.CharField(max_length=30, choices=[
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('CHANGES_REQUESTED', 'Changes Requested'),
    ])
    comments = models.TextField(blank=True, null=True)
    action_date = models.DateTimeField(auto_now_add=True)

class ApprovalDelegate(TimeStampedModel):
    primary_approver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='delegations_given')
    delegate_approver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='delegations_received')
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('primary_approver', 'delegate_approver', 'start_date')

class Attachment(TimeStampedModel):
    DOCUMENT_TYPES = (
        ('TRAINING_DOCUMENT', 'Training document'),
        ('QUOTATION', 'Quotation'),
        ('OTHER', 'Other supporting document'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.ForeignKey(TrainingRequest, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='training_attachments/')
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50, blank=True, null=True)
    document_type = models.CharField(max_length=30, choices=DOCUMENT_TYPES, default='OTHER')
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='training_attachments',
        null=True,
        blank=True,
    )
    approval_status = models.CharField(max_length=20, default='PENDING_REVIEW', choices=(
        ('PENDING_REVIEW', 'Pending review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ))

    def __str__(self):
        return f"Attachment for {self.request.id} - {self.file_name}"

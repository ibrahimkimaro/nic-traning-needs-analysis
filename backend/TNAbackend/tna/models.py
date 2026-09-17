from django.db import models
import uuid
from core.models import TimeStampedModel
from accounts.models import User


class TrainingRequestStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    SUBMITTED = 'SUBMITTED', 'Submitted'
    HOD_APPROVED = 'HOD_APPROVED', 'HOD Approved'
    HRO_PROCESSED = 'HRO_PROCESSED', 'HRO Processed'
    STRATEGIC_APPROVED = 'STRATEGIC_APPROVED', 'Strategic Approved'
    FULFILLMENT_ACTIVE = 'FULFILLMENT_ACTIVE', 'Fulfillment Active'
    COMPLETED = 'COMPLETED', 'Completed'

    # Backwards compatibility choices
    PENDING_DEPT = 'PENDING_DEPT', 'Pending Department Approval'
    DEPARTMENT_APPROVED = 'DEPARTMENT_APPROVED', 'Department Approved'
    HRO_REVIEW = 'HRO_REVIEW', 'Pending HRO Nomination'
    PENDING_HR_DIRECTOR = 'PENDING_HR_DIRECTOR', 'Pending HR Director Approval'
    PENDING_BUDGET = 'PENDING_BUDGET', 'Pending Budget Approval'
    BUDGET_APPROVED = 'BUDGET_APPROVED', 'Budget Approved'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'
    CHANGES_REQUESTED = 'CHANGES_REQUESTED', 'Changes Requested'


class TrainingRequest(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='training_requests')
    recipient = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='received_training_requests',
        null=True,
        blank=True,
        help_text="Target recipient / HOD reviewing this request"
    )
    status = models.CharField(
        max_length=30,
        default=TrainingRequestStatus.SUBMITTED,
        choices=TrainingRequestStatus.choices
    )
    current_approver = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='pending_approvals'
    )

    # HRO Administrative Verification & Anonymization
    eligibility_verified = models.BooleanField(default=False, help_text="HRO verified employee eligibility records")
    budget_line_item = models.CharField(max_length=100, blank=True, null=True, help_text="Validated budget line item code")
    is_anonymized = models.BooleanField(default=False, help_text="Anonymized for unbiased strategic evaluation")
    anonymized_reference = models.CharField(max_length=50, blank=True, null=True, help_text="Unbiased reference code e.g. ENG-0042")

    # Logistics Fulfillment (HRO Planning & Vendor Setup)
    logistics_vendor = models.CharField(max_length=200, blank=True, null=True, help_text="Selected training vendor / institute")
    logistics_venue = models.CharField(max_length=255, blank=True, null=True, help_text="Booked location / training platform")
    logistics_dates = models.CharField(max_length=100, blank=True, null=True, help_text="Execution dates locked by HRO")
    calendar_invites_sent = models.BooleanField(default=False, help_text="Calendar invitations coordinated and sent")

    # Legacy / compatibility fields (nullable to ensure smooth migration)
    title = models.CharField(max_length=255, blank=True, default='')
    reason = models.TextField(blank=True, default='')
    desired_outcome = models.TextField(blank=True, null=True)
    estimated_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    training_place = models.CharField(max_length=255, null=True, blank=True)
    participants = models.ManyToManyField(User, blank=True, related_name='participating_training_requests')

    @property
    def display_title(self):
        items = list(self.items.all())
        if items:
            return ", ".join(item.title for item in items)
        return self.title or f"Request {str(self.id)[:8]}"

    def __str__(self):
        return f"Request {str(self.id)[:8]} - {self.employee.get_full_name()}"


class TrainingRequestItem(TimeStampedModel):
    class ItemStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        NOMINATED = 'NOMINATED', 'Nominated'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.ForeignKey(TrainingRequest, on_delete=models.CASCADE, related_name='items')
    
    # Employee input
    title = models.CharField(max_length=255)
    justification = models.TextField()
    desired_outcome = models.TextField()

    # HRO nomination / scheduling fields
    is_selected = models.BooleanField(default=False)
    status = models.CharField(max_length=30, default=ItemStatus.PENDING, choices=ItemStatus.choices)
    planned_year = models.PositiveIntegerField(null=True, blank=True)
    planned_month = models.PositiveSmallIntegerField(null=True, blank=True, help_text="Month 1 to 12")
    training_place = models.CharField(max_length=255, null=True, blank=True)
    estimated_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)

    def __str__(self):
        return f"{self.title} ({self.request.employee.get_full_name()})"


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
    item = models.ForeignKey(TrainingRequestItem, on_delete=models.CASCADE, related_name='attachments', null=True, blank=True)
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


class TrainingRequestComment(TimeStampedModel):
    request = models.ForeignKey(TrainingRequest, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.PROTECT, related_name='training_request_comments')
    body = models.TextField()

    def __str__(self):
        return f"Comment by {self.author.get_full_name()} on {self.request_id}"


class TrainingRequestParticipantResponse(TimeStampedModel):
    RESPONSE_CHOICES = (
        ('PENDING', 'Pending response'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
    )
    request = models.ForeignKey(TrainingRequest, on_delete=models.CASCADE, related_name='participant_responses')
    participant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='training_request_responses')
    response = models.CharField(max_length=20, default='PENDING', choices=RESPONSE_CHOICES)

    class Meta:
        unique_together = ('request', 'participant')

    def __str__(self):
        return f"{self.participant.get_full_name()} - {self.response}"

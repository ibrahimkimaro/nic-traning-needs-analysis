from django.contrib import admin
from .models import TrainingRequest, TrainingRequestApproval, ApprovalDelegate, Attachment

@admin.register(TrainingRequest)
class TrainingRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee', 'title', 'status', 'estimated_cost')
    list_filter = ('status',)
    search_fields = ('title', 'employee__first_name', 'employee__last_name')

@admin.register(TrainingRequestApproval)
class TrainingRequestApprovalAdmin(admin.ModelAdmin):
    list_display = ('request', 'approver', 'action', 'action_date')

@admin.register(ApprovalDelegate)
class ApprovalDelegateAdmin(admin.ModelAdmin):
    list_display = ('primary_approver', 'delegate_approver', 'start_date', 'end_date', 'is_active')

@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('request', 'file_name', 'document_type', 'approval_status', 'uploaded_by')
    list_filter = ('document_type', 'approval_status')
    search_fields = ('file_name', 'request__title', 'uploaded_by__username')

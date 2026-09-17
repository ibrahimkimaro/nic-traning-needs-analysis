from django.contrib import admin
from .models import (
    TrainingRequest, TrainingRequestItem, TrainingRequestApproval,
    ApprovalDelegate, Attachment, TrainingRequestComment, TrainingRequestParticipantResponse
)


class TrainingRequestItemInline(admin.TabularInline):
    model = TrainingRequestItem
    extra = 1
    fields = ('title', 'justification', 'desired_outcome', 'is_selected', 'status', 'planned_year', 'planned_month', 'training_place', 'estimated_cost')


@admin.register(TrainingRequest)
class TrainingRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee', 'recipient', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('employee__first_name', 'employee__last_name', 'recipient__first_name', 'recipient__last_name')
    inlines = [TrainingRequestItemInline]


@admin.register(TrainingRequestItem)
class TrainingRequestItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'request', 'title', 'is_selected', 'status', 'planned_year', 'planned_month', 'training_place', 'estimated_cost')
    list_filter = ('is_selected', 'status')
    search_fields = ('title', 'request__employee__first_name', 'request__employee__last_name')


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


@admin.register(TrainingRequestComment)
class TrainingRequestCommentAdmin(admin.ModelAdmin):
    list_display = ('request', 'author', 'created_at')


@admin.register(TrainingRequestParticipantResponse)
class TrainingRequestParticipantResponseAdmin(admin.ModelAdmin):
    list_display = ('request', 'participant', 'response', 'created_at')

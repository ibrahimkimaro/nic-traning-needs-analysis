from django.contrib import admin
from .models import Assessment, AssessmentQuestion, AssessmentResponse, AssessmentResult

@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'version', 'created_by')

@admin.register(AssessmentQuestion)
class AssessmentQuestionAdmin(admin.ModelAdmin):
    list_display = ('assessment', 'competency', 'weight')
    list_filter = ('assessment',)

@admin.register(AssessmentResult)
class AssessmentResultAdmin(admin.ModelAdmin):
    list_display = ('employee', 'assessment', 'final_score', 'calculated_level', 'completed_at')
    list_filter = ('calculated_level',)
    search_fields = ('employee__first_name', 'employee__last_name')

@admin.register(AssessmentResponse)
class AssessmentResponseAdmin(admin.ModelAdmin):
    list_display = ('employee', 'question', 'response_value')

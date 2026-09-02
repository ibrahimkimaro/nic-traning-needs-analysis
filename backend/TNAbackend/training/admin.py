from django.contrib import admin
from .models import TrainingProvider, TrainingProgram, TrainingEnrollment, TrainingEvaluation, TrainingCompetency

@admin.register(TrainingProvider)
class TrainingProviderAdmin(admin.ModelAdmin):
    list_display = ('provider_name', 'contact_person', 'rating')

@admin.register(TrainingProgram)
class TrainingProgramAdmin(admin.ModelAdmin):
    list_display = ('title', 'provider', 'cost_per_person')
    search_fields = ('title',)

@admin.register(TrainingEnrollment)
class TrainingEnrollmentAdmin(admin.ModelAdmin):
    list_display = ('employee', 'program', 'completion_status', 'enrollment_date')
    list_filter = ('completion_status',)

@admin.register(TrainingEvaluation)
class TrainingEvaluationAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'level_1_score', 'level_2_score', 'evaluated_at')

@admin.register(TrainingCompetency)
class TrainingCompetencyAdmin(admin.ModelAdmin):
    list_display = ('program', 'competency', 'impact_level')

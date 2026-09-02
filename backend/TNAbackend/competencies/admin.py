from django.contrib import admin
from .models import Competency, PositionCompetency

@admin.register(Competency)
class CompetencyAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'category', 'is_mandatory')
    search_fields = ('code', 'name')

@admin.register(PositionCompetency)
class PositionCompetencyAdmin(admin.ModelAdmin):
    list_display = ('position', 'competency', 'required_level', 'importance')
    list_filter = ('importance',)

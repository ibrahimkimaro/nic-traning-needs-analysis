from rest_framework import serializers
from training.models import TrainingProvider, TrainingProgram, TrainingCompetency, TrainingEnrollment, TrainingEvaluation

class TrainingCompetencySerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingCompetency
        fields = ['id', 'competency', 'impact_level']

class TrainingProgramSerializer(serializers.ModelSerializer):
    competencies = TrainingCompetencySerializer(many=True, read_only=True, source='trainingcompetency_set')
    provider_name = serializers.ReadOnlyField(source='provider.provider_name')

    class Meta:
        model = TrainingProgram
        fields = ['id', 'title', 'description', 'duration_hours', 'provider', 'provider_name', 'cost_per_person', 'competencies']

class TrainingProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingProvider
        fields = '__all__'

class TrainingEnrollmentSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.get_full_name')
    program_title = serializers.ReadOnlyField(source='program.title')

    class Meta:
        model = TrainingEnrollment
        fields = ['id', 'program', 'program_title', 'employee', 'employee_name', 'enrollment_date', 'completion_status']

class TrainingEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingEvaluation
        fields = ['id', 'enrollment', 'level_1_score', 'level_1_comments', 'level_2_score', 'level_3_rating', 'level_4_impact', 'evaluated_at']

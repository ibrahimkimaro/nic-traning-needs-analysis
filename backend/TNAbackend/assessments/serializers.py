from rest_framework import serializers
from assessments.models import Assessment, AssessmentQuestion, AssessmentResponse, AssessmentResult

class AssessmentQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentQuestion
        fields = ['id', 'competency', 'question_text', 'weight']

class AssessmentSerializer(serializers.ModelSerializer):
    questions = AssessmentQuestionSerializer(many=True, read_only=True, source='questions')

    class Meta:
        model = Assessment
        fields = ['id', 'title', 'version', 'created_by', 'questions']

class AssessmentResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentResponse
        fields = ['question', 'response_value']

class AssessmentResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentResult
        fields = ['id', 'employee', 'assessment', 'final_score', 'calculated_level', 'completed_at']

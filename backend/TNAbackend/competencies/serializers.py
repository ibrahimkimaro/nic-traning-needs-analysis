from rest_framework import serializers
from competencies.models import Competency, PositionCompetency

class PositionCompetencySerializer(serializers.ModelSerializer):
    class Meta:
        model = PositionCompetency
        fields = ['id', 'position', 'competency', 'required_level', 'importance']

class CompetencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Competency
        fields = ['id', 'code', 'name', 'description', 'category', 'is_mandatory']

from rest_framework import serializers


class KnowledgeQuerySerializer(serializers.Serializer):
    query = serializers.CharField(max_length=2000)
    request_id = serializers.UUIDField(required=False, allow_null=True)
    limit = serializers.IntegerField(min_value=1, max_value=20, default=5)
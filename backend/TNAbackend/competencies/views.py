from rest_framework import generics, permissions
from .models import Competency, PositionCompetency
from .serializers import CompetencySerializer, PositionCompetencySerializer

class CompetencyListView(generics.ListCreateAPIView):
    queryset = Competency.objects.all()
    serializer_class = CompetencySerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), permissions.IsAdminUser()] # Simplified for now

class PositionRequirementsView(generics.ListAPIView):
    serializer_class = PositionCompetencySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        position_id = self.kwargs['position_id']
        return PositionCompetency.objects.filter(position_id=position_id)

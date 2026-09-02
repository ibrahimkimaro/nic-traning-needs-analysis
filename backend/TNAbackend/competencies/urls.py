from django.urls import path
from .views import CompetencyListView, PositionRequirementsView

urlpatterns = [
    path('competencies/', CompetencyListView.as_view(), name='competency-list'),
    path('positions/<int:position_id>/requirements/', PositionRequirementsView.as_view(), name='position-requirements'),
]

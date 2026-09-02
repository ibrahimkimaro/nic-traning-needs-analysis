from django.urls import path
from .views import (
    TrainingProviderListView, TrainingProgramListView,
    TrainingEnrollmentView, TrainingEvaluationSubmitView
)

urlpatterns = [
    path('providers/', TrainingProviderListView.as_view(), name='provider-list'),
    path('programs/', TrainingProgramListView.as_view(), name='program-list'),
    path('enrollments/', TrainingEnrollmentView.as_view(), name='enrollment-list'),
    path('evaluations/submit/', TrainingEvaluationSubmitView.as_view(), name='evaluation-submit'),
]

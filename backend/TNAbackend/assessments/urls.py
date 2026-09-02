from django.urls import path
from .views import AssessmentListView, AssessmentSubmitView, AssessmentResultsView

urlpatterns = [
    path('assessments/', AssessmentListView.as_view(), name='assessment-list'),
    path('assessments/submit/', AssessmentSubmitView.as_view(), name='assessment-submit'),
    path('assessments/results/<uuid:employee_id>/', AssessmentResultsView.as_view(), name='assessment-results'),
]

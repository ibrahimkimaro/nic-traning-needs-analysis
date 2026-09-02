from django.urls import path
from .views import (
    TrainingRequestListView, TrainingRequestDetailView,
    TrainingRequestCreateView, TrainingRequestApprovalView,
    TrainingRequestAttachmentView, GapAnalysisView,
    TrainingRecommendationsView, DepartmentSkillMatrixView
)

urlpatterns = [
    path('requests/', TrainingRequestListView.as_view(), name='request-list'),
    path('requests/create/', TrainingRequestCreateView.as_view(), name='request-create'),
    path('requests/<uuid:pk>/', TrainingRequestDetailView.as_view(), name='request-detail'),
    path('requests/<uuid:pk>/approve/', TrainingRequestApprovalView.as_view(), name='request-approve'),
    path('requests/<uuid:pk>/attachments/', TrainingRequestAttachmentView.as_view(), name='request-attachments'),

    # TNA Engine
    path('analysis/<uuid:employee_id>/', GapAnalysisView.as_view(), name='gap-analysis'),
    path('recommendations/<uuid:employee_id>/', TrainingRecommendationsView.as_view(), name='recommendations'),
    path('matrix/department/<int:department_id>/', DepartmentSkillMatrixView.as_view(), name='dept-matrix'),
]

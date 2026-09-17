from django.urls import path
from .views import (
    TrainingRequestListView, TrainingRequestDetailView,
    TrainingRequestCreateView, TrainingRequestApprovalView,
    TrainingRequestAttachmentView, GapAnalysisView,
    TrainingRecommendationsView, DepartmentSkillMatrixView,
    MyTrainingRequestsView, RecipientListView,
    MacroBottleneckEvaluateView, MacroWeightedSkillMatrixView,
    MacroTelemetryAggregatorView, MacroEarlyWarningTriggersView,
    MacroAnonymizedNeedsView
)

urlpatterns = [
    path('recipients/', RecipientListView.as_view(), name='recipient-list'),
    path('requests/', TrainingRequestListView.as_view(), name='all request-list'),
    path('requests/me/',MyTrainingRequestsView.as_view(),name="list of my request"),
    path('requests/create/', TrainingRequestCreateView.as_view(), name='request-create'),
    path('requests/<uuid:pk>/', TrainingRequestDetailView.as_view(), name='request-detail'),
    path('requests/<uuid:pk>/approve/', TrainingRequestApprovalView.as_view(), name='request-approve'),
    path('requests/<uuid:pk>/attachments/', TrainingRequestAttachmentView.as_view(), name='request-attachments'),

    # Deterministic Enterprise Macro Features (Zero AI)
    path('macro/bottleneck-evaluate/', MacroBottleneckEvaluateView.as_view(), name='macro-bottleneck-evaluate'),
    path('macro/weighted-matrix/', MacroWeightedSkillMatrixView.as_view(), name='macro-weighted-matrix'),
    path('macro/telemetry/', MacroTelemetryAggregatorView.as_view(), name='macro-telemetry'),
    path('macro/early-warnings/', MacroEarlyWarningTriggersView.as_view(), name='macro-early-warnings'),
    path('macro/anonymized-needs/', MacroAnonymizedNeedsView.as_view(), name='macro-anonymized-needs'),

    # TNA Engine
    path('analysis/<uuid:employee_id>/', GapAnalysisView.as_view(), name='gap-analysis'),
    path('recommendations/<uuid:employee_id>/', TrainingRecommendationsView.as_view(), name='recommendations'),
    path('matrix/department/<int:department_id>/', DepartmentSkillMatrixView.as_view(), name='dept-matrix'),
]

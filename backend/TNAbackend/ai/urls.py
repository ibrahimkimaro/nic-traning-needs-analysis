from django.urls import path
from .views import AttachmentReviewView, GroundedAnswerView, KnowledgeQueryView


urlpatterns = [
    path('knowledge/query/', KnowledgeQueryView.as_view(), name='knowledge-query'),
    path('knowledge/answer/', GroundedAnswerView.as_view(), name='grounded-answer'),
    path('attachments/<uuid:pk>/review/', AttachmentReviewView.as_view(), name='attachment-review'),
]
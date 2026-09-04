from django.conf import settings
from django.db import models
from core.models import TimeStampedModel
from tna.models import Attachment, TrainingRequest
from pgvector.django import VectorField


class KnowledgeDocument(TimeStampedModel):
    STATUS_CHOICES = (
        ('PENDING', 'Pending extraction'),
        ('INDEXED', 'Indexed'),
        ('FAILED', 'Extraction failed'),
        ('UNSUPPORTED', 'Unsupported format'),
    )

    attachment = models.OneToOneField(Attachment, on_delete=models.CASCADE, related_name='knowledge_document')
    title = models.CharField(max_length=255)
    extraction_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    approval_status = models.CharField(max_length=20, default='PENDING_REVIEW', choices=(
        ('PENDING_REVIEW', 'Pending review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ))
    extracted_at = models.DateTimeField(null=True, blank=True)
    extraction_error = models.TextField(blank=True)


class KnowledgeChunk(TimeStampedModel):
    document = models.ForeignKey(KnowledgeDocument, on_delete=models.CASCADE, related_name='chunks')
    chunk_index = models.PositiveIntegerField()
    page_number = models.PositiveIntegerField(null=True, blank=True)
    text = models.TextField()
    embedding = VectorField(dimensions=768, null=True, blank=True)
    embedding_model = models.CharField(max_length=120, blank=True)

    class Meta:
        ordering = ('document', 'chunk_index')
        unique_together = ('document', 'chunk_index')


class AIQueryAudit(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    request = models.ForeignKey(TrainingRequest, on_delete=models.SET_NULL, null=True, blank=True)
    query = models.TextField()
    source_ids = models.JSONField(default=list)
    result_count = models.PositiveIntegerField(default=0)


class AIRequest(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    operation = models.CharField(max_length=80)
    prompt_version = models.CharField(max_length=40, default='grounded-v1')
    model = models.CharField(max_length=120, blank=True)
    source_ids = models.JSONField(default=list)
    payload = models.JSONField(default=dict)


class AIResponse(TimeStampedModel):
    request = models.OneToOneField(AIRequest, on_delete=models.CASCADE, related_name='response')
    status = models.CharField(max_length=30)
    answer = models.TextField(blank=True)
    citations = models.JSONField(default=list)
    latency_ms = models.PositiveIntegerField(null=True, blank=True)
    error = models.TextField(blank=True)
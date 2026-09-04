from django.contrib import admin
from .models import AIQueryAudit, AIRequest, AIResponse, KnowledgeChunk, KnowledgeDocument


@admin.register(KnowledgeDocument)
class KnowledgeDocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'extraction_status', 'approval_status', 'extracted_at')
    list_filter = ('extraction_status', 'approval_status')


@admin.register(KnowledgeChunk)
class KnowledgeChunkAdmin(admin.ModelAdmin):
    list_display = ('document', 'chunk_index', 'page_number')


@admin.register(AIQueryAudit)
class AIQueryAuditAdmin(admin.ModelAdmin):
    list_display = ('user', 'request', 'result_count', 'created_at')


@admin.register(AIRequest)
class AIRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'operation', 'model', 'created_at')


@admin.register(AIResponse)
class AIResponseAdmin(admin.ModelAdmin):
    list_display = ('request', 'status', 'latency_ms', 'created_at')
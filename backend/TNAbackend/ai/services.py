import json
import math
import os
import time
from pathlib import Path
from urllib import request as http_request

from django.db.models import Q
from django.utils import timezone
from pgvector.django import CosineDistance

from accounts.models import User
from .models import AIQueryAudit, AIRequest, AIResponse, KnowledgeChunk, KnowledgeDocument


CHUNK_SIZE = 1200
CHUNK_OVERLAP = 200
PRIVILEGED_ROLES = {'ADMIN', 'HR_MANAGER', 'TRAINER', 'DIRECTOR'}


def ingest_attachment(attachment):
    document, _ = KnowledgeDocument.objects.get_or_create(
        attachment=attachment,
        defaults={'title': attachment.file_name},
    )
    document.title = attachment.file_name
    document.approval_status = attachment.approval_status

    if Path(attachment.file.name).suffix.lower() != '.pdf':
        document.extraction_status = 'UNSUPPORTED'
        document.extraction_error = 'Only PDF extraction is enabled for the first RAG slice.'
        document.save(update_fields=['title', 'approval_status', 'extraction_status', 'extraction_error', 'updated_at'])
        return document

    try:
        from pypdf import PdfReader

        reader = PdfReader(attachment.file.path)
        KnowledgeChunk.objects.filter(document=document).delete()
        chunks = []
        for page_number, page in enumerate(reader.pages, start=1):
            text = (page.extract_text() or '').strip()
            for chunk_index, chunk_text in enumerate(_split_text(text), start=len(chunks)):
                chunks.append(KnowledgeChunk(
                    document=document,
                    chunk_index=chunk_index,
                    page_number=page_number,
                    text=chunk_text,
                ))
        KnowledgeChunk.objects.bulk_create(chunks)
        _embed_chunks(chunks)
        document.extraction_status = 'INDEXED'
        document.extracted_at = timezone.now()
        document.extraction_error = ''
        document.save(update_fields=[
            'title', 'approval_status', 'extraction_status', 'extracted_at',
            'extraction_error', 'updated_at',
        ])
    except Exception as error:
        document.extraction_status = 'FAILED'
        document.extraction_error = str(error)[:1000]
        document.save(update_fields=['title', 'approval_status', 'extraction_status', 'extraction_error', 'updated_at'])
    return document


def _split_text(text):
    if not text:
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + CHUNK_SIZE, len(text))
        chunks.append(text[start:end])
        if end == len(text):
            break
        start = end - CHUNK_OVERLAP
    return chunks


def authorized_documents(user, request_id=None):
    documents = KnowledgeDocument.objects.filter(
        extraction_status='INDEXED',
        approval_status='APPROVED',
        attachment__approval_status='APPROVED',
    ).select_related('attachment__request__employee')
    role_names = set(user.roles.values_list('role_name', flat=True))

    if user.is_superuser or user.is_staff or role_names & PRIVILEGED_ROLES:
        return documents
    if role_names.__contains__('DEPT_HEAD'):
        documents = documents.filter(
            Q(attachment__request__employee=user) |
            Q(attachment__request__employee__supervisor=user)
        )
    else:
        documents = documents.filter(attachment__request__employee=user)
    if request_id:
        documents = documents.filter(attachment__request_id=request_id)
    return documents


def retrieve_knowledge(user, query, request_id=None, limit=5):
    terms = [term for term in query.split() if len(term) > 2][:12]
    if not terms:
        return []
    condition = Q()
    for term in terms:
        condition |= Q(text__icontains=term)
    documents = authorized_documents(user, request_id)
    query_embedding = _embed_text(query)
    if query_embedding:
        chunks = KnowledgeChunk.objects.filter(
            document__in=documents,
            embedding__isnull=False,
        ).annotate(distance=CosineDistance('embedding', query_embedding)).order_by('distance')
        return list(chunks[:limit])
    chunks = KnowledgeChunk.objects.filter(document__in=documents).filter(condition)
    scored = []
    for chunk in chunks:
        lower_text = chunk.text.lower()
        score = sum(lower_text.count(term.lower()) for term in terms)
        scored.append((score, chunk))
    scored.sort(key=lambda item: (-item[0], item[1].document_id, item[1].chunk_index))
    return [chunk for _, chunk in scored[:limit]]


def _embed_chunks(chunks):
    for chunk in chunks:
        embedding = _embed_text(chunk.text)
        if embedding:
            chunk.embedding = embedding
            chunk.embedding_model = os.getenv('AI_EMBEDDING_MODEL', 'nomic-embed-text')
            chunk.save(update_fields=['embedding', 'embedding_model', 'updated_at'])


def _embed_text(text):
    base_url = os.getenv('AI_EMBEDDING_BASE_URL')
    model = os.getenv('AI_EMBEDDING_MODEL', 'nomic-embed-text')
    if base_url:
        endpoint = f'{base_url.rstrip("/")}/embeddings'
        payload = json.dumps({'model': model, 'input': text}).encode('utf-8')
    else:
        endpoint = f'{os.getenv("AI_OLLAMA_BASE_URL", "http://127.0.0.1:11434")}/api/embed'
        payload = json.dumps({'model': model, 'input': text}).encode('utf-8')
    headers = {'Content-Type': 'application/json'}
    api_key = os.getenv('AI_EMBEDDING_API_KEY') or os.getenv('AI_LLM_API_KEY') or os.getenv('API_KEY')
    if api_key:
        headers['Authorization'] = f'Bearer {api_key}'
    try:
        req = http_request.Request(endpoint, data=payload, headers=headers)
        with http_request.urlopen(req, timeout=30) as result:
            body = json.loads(result.read().decode('utf-8'))
        vector = body.get('data', [{}])[0].get('embedding') if base_url else body.get('embeddings', [[]])[0]
        if len(vector or []) != 768:
            return None
        norm = math.sqrt(sum(value * value for value in vector))
        return [value / norm for value in vector] if norm else None
    except Exception:
        return None


def audit_query(user, query, chunks, request_id=None):
    return AIQueryAudit.objects.create(
        user=user,
        request_id=request_id,
        query=query,
        source_ids=[str(chunk.id) for chunk in chunks],
        result_count=len(chunks),
    )


def generate_grounded_answer(user, query, chunks, request_id=None):
    """Call an OpenAI-compatible LLM only after authorization and retrieval."""
    source_ids = [str(chunk.id) for chunk in chunks]
    ai_request = AIRequest.objects.create(
        user=user,
        operation='GROUNDED_QA',
        model=os.getenv('AI_LLM_MODEL', ''),
        source_ids=source_ids,
        payload={'query': query, 'request_id': str(request_id) if request_id else None},
    )
    started = time.monotonic()
    if not chunks:
        response = AIResponse.objects.create(
            request=ai_request,
            status='INSUFFICIENT_EVIDENCE',
            answer='The approved organizational sources do not contain enough information to answer this question.',
            latency_ms=_elapsed_ms(started),
        )
        return response

    context = '\n\n'.join(
        f'[SOURCE {index}: {chunk.document.attachment.file_name}, page {chunk.page_number or "unknown"}]\n{chunk.text}'
        for index, chunk in enumerate(chunks, start=1)
    )
    model = os.getenv('AI_LLM_MODEL', 'mistral')
    system_prompt = (
        'You are the TNA organization assistant. Answer only from the supplied sources. '
        'Do not invent facts, calculate authoritative amounts, approve requests, or bypass permissions. '
        'If the sources do not support the answer, say that there is insufficient approved evidence. '
        'Cite sources using [SOURCE n].'
    )
    base_url = os.getenv('AI_LLM_BASE_URL')
    if base_url:
        endpoint = f'{base_url.rstrip("/")}/chat/completions'
        payload = {'model': model, 'temperature': 0, 'messages': [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': f'Question:\n{query}\n\nApproved evidence:\n{context}'},
        ]}
    else:
        endpoint = f'{os.getenv("AI_OLLAMA_BASE_URL", "http://127.0.0.1:11434")}/api/chat'
        payload = {'model': model, 'stream': False, 'messages': [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': f'Question:\n{query}\n\nApproved evidence:\n{context}'},
        ]}
    payload = json.dumps(payload).encode('utf-8')
    headers = {'Content-Type': 'application/json'}
    api_key = os.getenv('AI_LLM_API_KEY') or os.getenv('API_KEY')
    if api_key:
        headers['Authorization'] = f'Bearer {api_key}'
    try:
        req = http_request.Request(endpoint, data=payload, headers=headers)
        with http_request.urlopen(req, timeout=60) as result:
            body = json.loads(result.read().decode('utf-8'))
        answer = (
            body['choices'][0]['message']['content']
            if base_url else body['message']['content']
        ).strip()
        response = AIResponse.objects.create(
            request=ai_request,
            status='COMPLETED',
            answer=answer,
            citations=source_ids,
            latency_ms=_elapsed_ms(started),
        )
    except Exception as error:
        response = AIResponse.objects.create(
            request=ai_request,
            status='FAILED',
            citations=source_ids,
            latency_ms=_elapsed_ms(started),
            error=str(error)[:1000],
        )
    return response


def _elapsed_ms(started):
    return max(0, int((time.monotonic() - started) * 1000))
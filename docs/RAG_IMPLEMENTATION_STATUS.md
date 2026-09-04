# TNA RAG Implementation Status

## Implemented flow

1. An employee creates a training request.
2. The employee uploads PDF training documents and quotations as request attachments.
3. The backend extracts PDF text page by page and stores provenance-preserving chunks.
4. A document remains unavailable to retrieval until it is approved.
5. The employee's Head of Department reviews the request.
6. When the HOD approves the request, its attachments become approved knowledge sources.
7. The backend retrieves only authorized chunks and generates a grounded summary.
8. The approval response returns the summary status, text, and source identifiers.
9. The React approval queue displays that summary to the reviewer.

## AI boundaries

- PostgreSQL remains authoritative for employees, permissions, costs, scores, and workflow status.
- RAG retrieves approved document evidence.
- The LLM summarizes and explains evidence only.
- The LLM cannot approve requests, calculate official budgets, or bypass permissions.
- Retrieval and generation requests are recorded in `AIQueryAudit`, `AIRequest`, and `AIResponse`.

## Local model configuration

The current machine has native Ollama endpoints:

- Chat model: `mistral`
- Embedding model: `nomic-embed-text`
- Ollama base URL: `http://127.0.0.1:11434`

When OpenAI-compatible URLs are not configured, the backend uses Ollama's native `/api/embed` and `/api/chat` endpoints. The embedding vector size is 768.

Optional environment variables:

```env
AI_OLLAMA_BASE_URL=http://127.0.0.1:11434
AI_EMBEDDING_MODEL=nomic-embed-text
AI_LLM_MODEL=mistral
```

## API endpoints

- `POST /api/v1/tna/requests/<id>/attachments/`
- `POST /api/v1/tna/requests/<id>/approve/`
- `POST /api/v1/ai/knowledge/query/`
- `POST /api/v1/ai/knowledge/answer/`
- `POST /api/v1/ai/attachments/<id>/review/`

## Remaining work

- Add trainer/HR document-management screens and approval controls.
- Add session/module mapping for training material.
- Add grounded daily quiz generation with question evidence records.
- Add final assessment, remediation, and impact-report workflows.
- Add automated permission-leakage and retrieval-quality evaluation cases.
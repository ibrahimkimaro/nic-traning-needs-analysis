from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from tna.models import Attachment, TrainingRequest
from .serializers import KnowledgeQuerySerializer
from .services import audit_query, generate_grounded_answer, ingest_attachment, retrieve_knowledge


class KnowledgeQueryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = KnowledgeQuerySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request_id = serializer.validated_data.get('request_id')
        if request_id and not TrainingRequest.objects.filter(id=request_id).exists():
            return Response({'detail': 'Training request not found.'}, status=status.HTTP_404_NOT_FOUND)
        chunks = retrieve_knowledge(
            request.user,
            serializer.validated_data['query'],
            request_id=request_id,
            limit=serializer.validated_data['limit'],
        )
        audit_query(request.user, serializer.validated_data['query'], chunks, request_id)
        return Response({
            'answer_status': 'EVIDENCE_FOUND' if chunks else 'INSUFFICIENT_EVIDENCE',
            'sources': [
                {
                    'chunk_id': str(chunk.id),
                    'document_id': str(chunk.document_id),
                    'file_name': chunk.document.attachment.file_name,
                    'page_number': chunk.page_number,
                    'text': chunk.text,
                }
                for chunk in chunks
            ],
        })


class GroundedAnswerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = KnowledgeQuerySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request_id = serializer.validated_data.get('request_id')
        chunks = retrieve_knowledge(
            request.user,
            serializer.validated_data['query'],
            request_id=request_id,
            limit=serializer.validated_data['limit'],
        )
        audit_query(request.user, serializer.validated_data['query'], chunks, request_id)
        result = generate_grounded_answer(request.user, serializer.validated_data['query'], chunks, request_id)
        return Response({
            'status': result.status,
            'answer': result.answer,
            'citations': result.citations,
            'error': result.error,
        })


class AttachmentReviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        attachment = Attachment.objects.select_related('request__employee').get(pk=pk)
        roles = set(request.user.roles.values_list('role_name', flat=True))
        is_supervisor = attachment.request.employee.supervisor_id == request.user.id
        allowed = request.user.is_superuser or request.user.is_staff or roles & {'ADMIN', 'HR_MANAGER'} or (
            'DEPT_HEAD' in roles and is_supervisor
        )
        if not allowed:
            return Response({'detail': 'You are not allowed to review this document.'}, status=status.HTTP_403_FORBIDDEN)
        approval_status = request.data.get('approval_status')
        if approval_status not in {'APPROVED', 'REJECTED'}:
            return Response({'detail': 'approval_status must be APPROVED or REJECTED.'}, status=status.HTTP_400_BAD_REQUEST)
        attachment.approval_status = approval_status
        attachment.save(update_fields=['approval_status', 'updated_at'])
        document = getattr(attachment, 'knowledge_document', None)
        if document:
            document.approval_status = approval_status
            document.save(update_fields=['approval_status', 'updated_at'])
        return Response({'id': str(attachment.id), 'approval_status': approval_status})
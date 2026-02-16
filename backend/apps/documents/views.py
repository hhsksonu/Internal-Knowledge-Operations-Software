"""
Document Management Views.

Endpoints:
- POST /api/documents/upload/ - Upload new document
- GET /api/documents/ - List documents
- GET /api/documents/<id>/ - Get document details
- PUT /api/documents/<id>/ - Update document
- DELETE /api/documents/<id>/ - Delete document
- POST /api/documents/<id>/approve/ - Approve/archive document
- POST /api/documents/<id>/new-version/ - Upload new version
"""

from rest_framework import status, generics, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q

from .models import Document, DocumentVersion, DocumentStatus
from .serializers import (
    DocumentSerializer,
    DocumentDetailSerializer,
    DocumentUploadSerializer,
    DocumentApprovalSerializer,
    DocumentVersionSerializer
)
from .tasks import process_document_task
from apps.core.permissions import IsContentOwner, IsOwnerOrReadOnly
from apps.audit.services import AuditService


class DocumentUploadView(views.APIView):
    """
    Upload a new document.
    
    POST /api/documents/upload/
    
    Accepts multipart/form-data with:
    - file: Document file (required)
    - title: Document title (required)
    - description: Description (optional)
    - tags: JSON array of tags (optional)
    - department: Department name (optional)
    
    Response:
    - 201: Document created, processing started
    - 400: Validation error
    """
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = DocumentUploadSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            # Create document and version
            result = serializer.save()
            document = result['document']
            version = result['version']
            
            # Trigger async processing
            process_document_task.delay(version.id)
            
            # Log action
            AuditService.log_action(
                user=request.user,
                action='DOCUMENT_UPLOAD',
                resource_type='Document',
                resource_id=document.id,
                details={
                    'title': document.title,
                    'version': version.version_number,
                    'file_type': version.file_type,
                    'file_size': version.file_size
                },
                request=request
            )
            
            return Response({
                'message': 'Document uploaded successfully. Processing started.',
                'document': DocumentDetailSerializer(
                    document,
                    context={'request': request}
                ).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class DocumentListView(generics.ListAPIView):
    """
    List documents with filtering.
    
    GET /api/documents/
    
    Query params:
    - status: Filter by status (DRAFT, APPROVED, ARCHIVED)
    - owner: Filter by owner username
    - department: Filter by department
    - tags: Filter by tags (comma-separated)
    - search: Search in title and description
    
    Returns only documents user has permission to see:
    - Own documents
    - Approved documents in their department
    - All documents (if admin)
    """
    
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Document.objects.select_related('owner', 'approved_by')
        
        # Permission filtering
        if not user.is_admin():
            # Users can see:
            # 1. Their own documents
            # 2. Approved documents
            queryset = queryset.filter(
                Q(owner=user) | Q(status=DocumentStatus.APPROVED)
            )
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by owner
        owner = self.request.query_params.get('owner')
        if owner:
            queryset = queryset.filter(owner__username=owner)
        
        # Filter by department
        department = self.request.query_params.get('department')
        if department:
            queryset = queryset.filter(department__iexact=department)
        
        # Filter by tags
        tags = self.request.query_params.get('tags')
        if tags:
            tag_list = [t.strip() for t in tags.split(',')]
            # Filter documents that have any of these tags
            for tag in tag_list:
                queryset = queryset.filter(tags__contains=[tag])
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset.order_by('-created_at')


class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update, or delete a document.
    
    GET /api/documents/<id>/ - Get details with all versions
    PUT /api/documents/<id>/ - Update document metadata
    DELETE /api/documents/<id>/ - Delete document
    """
    
    queryset = Document.objects.all()
    serializer_class = DocumentDetailSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def perform_destroy(self, instance):
        """
        Soft delete: Archive instead of deleting.
        """
        instance.status = DocumentStatus.ARCHIVED
        instance.save()
        
        # Log action
        AuditService.log_action(
            user=self.request.user,
            action='DOCUMENT_DELETE',
            resource_type='Document',
            resource_id=instance.id,
            details={'title': instance.title}
        )


class DocumentApprovalView(views.APIView):
    """
    Approve or archive a document.
    
    POST /api/documents/<pk>/approve/
    
    Request body:
    {
        "action": "approve"  // or "archive"
    }
    
    Only content owners can approve documents.
    """
    
    permission_classes = [IsAuthenticated, IsContentOwner]
    
    def post(self, request, pk):
        try:
            document = Document.objects.get(pk=pk)
        except Document.DoesNotExist:
            return Response(
                {'error': 'Document not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = DocumentApprovalSerializer(
            data=request.data,
            context={'document': document}
        )
        
        if serializer.is_valid():
            action = serializer.validated_data['action']
            
            if action == 'approve':
                document.status = DocumentStatus.APPROVED
                document.approved_by = request.user
                document.approved_at = timezone.now()
                message = 'Document approved successfully'
                audit_action = 'DOCUMENT_APPROVE'
            else:  # archive
                document.status = DocumentStatus.ARCHIVED
                message = 'Document archived successfully'
                audit_action = 'DOCUMENT_ARCHIVE'
            
            document.save()
            
            # Log action
            AuditService.log_action(
                user=request.user,
                action=audit_action,
                resource_type='Document',
                resource_id=document.id,
                details={'title': document.title}
            )
            
            return Response({
                'message': message,
                'document': DocumentSerializer(document).data
            }, status=status.HTTP_200_OK)
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class DocumentNewVersionView(views.APIView):
    """
    Upload a new version of an existing document.
    
    POST /api/documents/<pk>/new-version/
    
    Accepts multipart/form-data with:
    - file: New document file
    """
    
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def post(self, request, pk):
        try:
            document = Document.objects.get(pk=pk)
        except Document.DoesNotExist:
            return Response(
                {'error': 'Document not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permissions
        if document.owner != request.user and not request.user.is_admin():
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validate file
        file = request.FILES.get('file')
        if not file:
            return Response(
                {'error': 'File is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get next version number
        next_version = document.current_version + 1
        
        # Create new version
        version = DocumentVersion.objects.create(
            document=document,
            version_number=next_version,
            file=file,
            file_size=file.size,
            file_type=file.name.split('.')[-1].lower()
        )
        
        # Trigger processing
        process_document_task.delay(version.id)
        
        # Log action
        AuditService.log_action(
            user=request.user,
            action='DOCUMENT_VERSION_UPLOAD',
            resource_type='DocumentVersion',
            resource_id=version.id,
            details={
                'document_title': document.title,
                'version': version.version_number,
                'file_type': version.file_type
            }
        )
        
        return Response({
            'message': f'Version {next_version} uploaded successfully. Processing started.',
            'version': DocumentVersionSerializer(
                version,
                context={'request': request}
            ).data
        }, status=status.HTTP_201_CREATED)


class DocumentProcessingStatusView(views.APIView):
    """
    Get processing status for a document version.
    
    GET /api/documents/versions/<id>/status/
    
    Useful for polling to check if document is ready.
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            version = DocumentVersion.objects.get(pk=pk)
        except DocumentVersion.DoesNotExist:
            return Response(
                {'error': 'Document version not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response({
            'version_id': version.id,
            'document_id': version.document.id,
            'document_title': version.document.title,
            'version_number': version.version_number,
            'processing_status': version.processing_status,
            'total_chunks': version.total_chunks,
            'error_message': version.error_message,
            'created_at': version.created_at,
            'processed_at': version.processed_at
        })

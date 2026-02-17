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
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = DocumentUploadSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            #document and version
            result = serializer.save()
            document = result['document']
            version = result['version']
            
            #async processing
            process_document_task.delay(version.id)
            
            # Log
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

    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Document.objects.select_related('owner', 'approved_by')
        
        # Permission filtering
        if not user.is_admin():

            queryset = queryset.filter(
                Q(owner=user) | Q(status=DocumentStatus.APPROVED)
            )
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        owner = self.request.query_params.get('owner')
        if owner:
            queryset = queryset.filter(owner__username=owner)
        
        department = self.request.query_params.get('department')
        if department:
            queryset = queryset.filter(department__iexact=department)
        
        tags = self.request.query_params.get('tags')
        if tags:
            tag_list = [t.strip() for t in tags.split(',')]
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

    queryset = Document.objects.all()
    serializer_class = DocumentDetailSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def perform_destroy(self, instance):

        instance.status = DocumentStatus.ARCHIVED
        instance.save()
        
        # Log 
        AuditService.log_action(
            user=self.request.user,
            action='DOCUMENT_DELETE',
            resource_type='Document',
            resource_id=instance.id,
            details={'title': instance.title}
        )


class DocumentApprovalView(views.APIView):

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
        
        next_version = document.current_version + 1
        
        version = DocumentVersion.objects.create(
            document=document,
            version_number=next_version,
            file=file,
            file_size=file.size,
            file_type=file.name.split('.')[-1].lower()
        )
        
        # processing
        process_document_task.delay(version.id)
        
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

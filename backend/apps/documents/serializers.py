"""
Serializers for Document Management.
"""

from rest_framework import serializers
from django.conf import settings
from .models import Document, DocumentVersion, DocumentChunk, DocumentStatus


class DocumentChunkSerializer(serializers.ModelSerializer):
    """
    Serializer for DocumentChunk.
    
    Used primarily for displaying search results with source attribution.
    """
    
    document_title = serializers.CharField(source='document.title', read_only=True)
    version_number = serializers.IntegerField(source='version.version_number', read_only=True)
    
    class Meta:
        model = DocumentChunk
        fields = [
            'id', 'chunk_index', 'text', 'metadata',
            'document_title', 'version_number'
        ]
        # Don't expose embeddings in API responses (too large)


class DocumentVersionSerializer(serializers.ModelSerializer):
    """
    Serializer for DocumentVersion.
    
    Displays version information including processing status.
    """
    
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentVersion
        fields = [
            'id', 'version_number', 'file_url', 'file_size', 'file_type',
            'processing_status', 'total_chunks', 'embedding_model',
            'error_message', 'created_at', 'processed_at'
        ]
        read_only_fields = [
            'processing_status', 'total_chunks', 'embedding_model',
            'error_message', 'processed_at'
        ]
    
    def get_file_url(self, obj):
        """Return full URL for the file"""
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class DocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for Document (list view).
    
    Shows basic document information without all versions.
    """
    
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    owner_name = serializers.SerializerMethodField()
    approved_by_username = serializers.CharField(
        source='approved_by.username',
        read_only=True,
        allow_null=True
    )
    current_version = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'description', 'owner', 'owner_username',
            'owner_name', 'status', 'tags', 'department',
            'current_version', 'created_at', 'updated_at',
            'approved_at', 'approved_by_username'
        ]
        read_only_fields = [
            'owner', 'created_at', 'updated_at',
            'approved_at', 'approved_by_username'
        ]
    
    def get_owner_name(self, obj):
        """Get owner's full name"""
        return f"{obj.owner.first_name} {obj.owner.last_name}".strip()


class DocumentDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for Document (detail view).
    
    Includes all versions and more detailed information.
    """
    
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    owner_name = serializers.SerializerMethodField()
    approved_by_username = serializers.CharField(
        source='approved_by.username',
        read_only=True,
        allow_null=True
    )
    versions = DocumentVersionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'description', 'owner', 'owner_username',
            'owner_name', 'status', 'tags', 'department',
            'versions', 'created_at', 'updated_at',
            'approved_at', 'approved_by_username'
        ]
        read_only_fields = [
            'owner', 'created_at', 'updated_at',
            'approved_at', 'approved_by_username'
        ]
    
    def get_owner_name(self, obj):
        """Get owner's full name"""
        return f"{obj.owner.first_name} {obj.owner.last_name}".strip()


class DocumentUploadSerializer(serializers.Serializer):
    """
    Serializer for document upload.
    
    Handles file upload and creates Document + DocumentVersion.
    """
    
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    file = serializers.FileField()
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        allow_empty=True
    )
    department = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True
    )
    
    def validate_file(self, value):
        """
        Validate file size and type.
        """
        # Check file size
        max_size = settings.DOCUMENT_CONFIG['MAX_FILE_SIZE_MB'] * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError(
                f"File size exceeds {settings.DOCUMENT_CONFIG['MAX_FILE_SIZE_MB']}MB limit."
            )
        
        # Check file type
        file_ext = value.name.split('.')[-1].lower()
        allowed_types = settings.DOCUMENT_CONFIG['ALLOWED_FILE_TYPES']
        if file_ext not in allowed_types:
            raise serializers.ValidationError(
                f"File type .{file_ext} not allowed. Allowed types: {', '.join(allowed_types)}"
            )
        
        return value
    
    def create(self, validated_data):
        """
        Create Document and DocumentVersion.
        
        Note: This doesn't process the document yet.
        That happens in a Celery task triggered by the view.
        """
        file = validated_data.pop('file')
        user = self.context['request'].user
        
        # Create document
        document = Document.objects.create(
            title=validated_data['title'],
            description=validated_data.get('description', ''),
            owner=user,
            tags=validated_data.get('tags', []),
            department=validated_data.get('department', '')
        )
        
        # Create first version
        version = DocumentVersion.objects.create(
            document=document,
            version_number=1,
            file=file,
            file_size=file.size,
            file_type=file.name.split('.')[-1].lower()
        )
        
        return {
            'document': document,
            'version': version
        }


class DocumentApprovalSerializer(serializers.Serializer):
    """
    Serializer for document approval.
    
    Content owners can approve documents to make them searchable.
    """
    
    action = serializers.ChoiceField(choices=['approve', 'archive'])
    
    def validate(self, attrs):
        """
        Validate that document can be approved.
        """
        document = self.context['document']
        
        if attrs['action'] == 'approve':
            # Check that the latest version is processed
            latest_version = document.versions.first()
            if not latest_version or latest_version.processing_status != 'READY':
                raise serializers.ValidationError(
                    "Cannot approve document: latest version not processed yet."
                )
        
        return attrs

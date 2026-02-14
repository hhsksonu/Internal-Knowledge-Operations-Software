"""
Document Management Models.

This module handles:
1. Document - Main document entity
2. DocumentVersion - Version tracking
3. DocumentChunk - Text chunks with embeddings
4. ProcessingStatus - Track async processing state
"""

from django.db import models
from django.conf import settings
from django.core.validators import FileExtensionValidator, MinValueValidator
from pgvector.django import VectorField
import os


class DocumentStatus(models.TextChoices):
    """
    Document Lifecycle States.
    
    DRAFT - Just uploaded, not yet approved for use
    APPROVED - Ready for querying
    ARCHIVED - Old version, hidden from search
    
    Why this workflow?
    - Quality control: Only approved docs are searchable
    - Prevents accidental exposure of draft/incorrect content
    """
    DRAFT = 'DRAFT', 'Draft'
    APPROVED = 'APPROVED', 'Approved'
    ARCHIVED = 'ARCHIVED', 'Archived'


class ProcessingStatus(models.TextChoices):
    """
    Document Processing States.
    
    Tracks async processing pipeline:
    UPLOADED -> PROCESSING -> READY (or FAILED)
    
    Why separate from DocumentStatus?
    - DocumentStatus is about approval workflow
    - ProcessingStatus is about technical processing state
    """
    UPLOADED = 'UPLOADED', 'Uploaded'
    PROCESSING = 'PROCESSING', 'Processing'
    READY = 'READY', 'Ready'
    FAILED = 'FAILED', 'Failed'


class Document(models.Model):
    """
    Main Document Entity.
    
    Represents a document in the system (PDF, DOCX, TXT).
    Each document can have multiple versions.
    
    Fields explained:
    - title: Human-readable name
    - owner: Who uploaded it (for permissions)
    - status: Draft/Approved/Archived
    - tags: For categorization and filtering
    - department: For access control (future feature)
    """
    
    title = models.CharField(
        max_length=255,
        help_text="Document title or name"
    )
    
    description = models.TextField(
        blank=True,
        help_text="Optional description of the document"
    )
    
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='documents',
        help_text="User who uploaded this document"
    )
    
    status = models.CharField(
        max_length=20,
        choices=DocumentStatus.choices,
        default=DocumentStatus.DRAFT,
        help_text="Document approval status"
    )
    
    tags = models.JSONField(
        default=list,
        blank=True,
        help_text="List of tags for categorization"
    )
    
    department = models.CharField(
        max_length=100,
        blank=True,
        help_text="Department this document belongs to"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this document was approved"
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_documents',
        help_text="Who approved this document"
    )
    
    class Meta:
        db_table = 'documents'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['owner']),
            models.Index(fields=['department']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} (v{self.current_version})"
    
    @property
    def current_version(self):
        """Get the latest version number"""
        latest = self.versions.order_by('-version_number').first()
        return latest.version_number if latest else 0


class DocumentVersion(models.Model):
    """
    Document Version Tracking.
    
    Why versioning?
    - Documents get updated over time
    - Need to track which version answered which query
    - Can roll back if new version has issues
    
    Processing flow:
    1. User uploads file -> status = UPLOADED
    2. Celery task extracts text -> status = PROCESSING
    3. Text chunked and embedded -> status = READY
    4. If anything fails -> status = FAILED
    """
    
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='versions',
        help_text="Parent document"
    )
    
    version_number = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Version number (1, 2, 3...)"
    )
    
    file = models.FileField(
        upload_to='documents/%Y/%m/%d/',
        validators=[FileExtensionValidator(
            allowed_extensions=['pdf', 'docx', 'txt']
        )],
        help_text="Uploaded file"
    )
    
    file_size = models.BigIntegerField(
        help_text="File size in bytes"
    )
    
    file_type = models.CharField(
        max_length=10,
        help_text="File extension (pdf, docx, txt)"
    )
    
    processing_status = models.CharField(
        max_length=20,
        choices=ProcessingStatus.choices,
        default=ProcessingStatus.UPLOADED,
        help_text="Current processing status"
    )
    
    # Processing metadata
    total_chunks = models.IntegerField(
        default=0,
        help_text="Number of chunks created"
    )
    
    embedding_model = models.CharField(
        max_length=100,
        blank=True,
        help_text="Embedding model used (for tracking)"
    )
    
    error_message = models.TextField(
        blank=True,
        help_text="Error details if processing failed"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When processing completed"
    )
    
    class Meta:
        db_table = 'document_versions'
        unique_together = ['document', 'version_number']
        ordering = ['-version_number']
        indexes = [
            models.Index(fields=['processing_status']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.document.title} v{self.version_number}"
    
    def get_file_extension(self):
        """Extract file extension from filename"""
        return os.path.splitext(self.file.name)[1][1:].lower()


class DocumentChunk(models.Model):
    """
    Text Chunks with Embeddings.
    
    Why chunks?
    - LLMs have token limits (can't process 100-page docs)
    - Better retrieval: Find specific relevant sections
    - Chunk size is a trade-off:
      * Too small: Lose context
      * Too large: Less precise retrieval
    
    Fields:
    - chunk_index: Order within the document (0, 1, 2...)
    - text: The actual text content
    - embedding: Vector representation for similarity search
    - metadata: Store page numbers, section headers, etc.
    """
    
    version = models.ForeignKey(
        DocumentVersion,
        on_delete=models.CASCADE,
        related_name='chunks',
        help_text="Document version this chunk belongs to"
    )
    
    chunk_index = models.IntegerField(
        help_text="Position in document (0-indexed)"
    )
    
    text = models.TextField(
        help_text="Text content of this chunk"
    )
    
    # Vector embedding for similarity search
    # Dimension depends on embedding model (e.g., 1536 for OpenAI ada-002)
    embedding = VectorField(
        dimensions=settings.LLM_CONFIG['EMBEDDING_DIMENSION'],
        help_text="Vector embedding for semantic search"
    )
    
    # Metadata for better attribution
    metadata = models.JSONField(
        default=dict,
        help_text="Additional metadata (page number, section, etc.)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'document_chunks'
        unique_together = ['version', 'chunk_index']
        indexes = [
            models.Index(fields=['version', 'chunk_index']),
            # Vector index for similarity search (pgvector)
            # This will be created via migration
        ]
    
    def __str__(self):
        return f"{self.version.document.title} v{self.version.version_number} chunk {self.chunk_index}"
    
    @property
    def document(self):
        """Convenience property to access parent document"""
        return self.version.document

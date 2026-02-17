from django.db import models
from django.conf import settings
from django.core.validators import FileExtensionValidator, MinValueValidator
from pgvector.django import VectorField
import os


class DocumentStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    APPROVED = 'APPROVED', 'Approved'
    ARCHIVED = 'ARCHIVED', 'Archived'


class ProcessingStatus(models.TextChoices):
    UPLOADED = 'UPLOADED', 'Uploaded'
    PROCESSING = 'PROCESSING', 'Processing'
    READY = 'READY', 'Ready'
    FAILED = 'FAILED', 'Failed'


class Document(models.Model):
    
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
    
    # Vector embedding for similarity 
    embedding = VectorField(
        dimensions=settings.LLM_CONFIG['EMBEDDING_DIMENSION'],
        help_text="Vector embedding for semantic search"
    )
    
    # Metadata for attribution
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
            # Vector index for similarity search
        ]
    
    def __str__(self):
        return f"{self.version.document.title} v{self.version.version_number} chunk {self.chunk_index}"
    
    @property
    def document(self):
        return self.version.document

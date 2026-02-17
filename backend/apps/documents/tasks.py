from celery import shared_task
from django.utils import timezone
import logging
import os

from .models import DocumentVersion, DocumentChunk, ProcessingStatus
from .services import DocumentProcessingService
from apps.retrieval.services import EmbeddingService

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60
)
def process_document_task(self, version_id: int):
    try:
        #get document
        version = DocumentVersion.objects.get(id=version_id)
        version.processing_status = ProcessingStatus.PROCESSING
        version.save()
        
        logger.info(f"Starting processing for document version {version_id}")
        
        # Step 1: Extract and chunk text
        chunks_data = extract_and_chunk_task(version_id)
        
        if not chunks_data:
            raise ValueError("No text extracted from document")
        
        #generate embeddings
        chunks_with_embeddings = generate_embeddings_task(chunks_data)
        
        # Step 3: Save chunks to database
        save_chunks_to_db(version_id, chunks_with_embeddings)
        
        # Update status 
        version.refresh_from_db()
        version.processing_status = ProcessingStatus.READY
        version.processed_at = timezone.now()
        version.total_chunks = len(chunks_with_embeddings)
        version.save()
        
        logger.info(
            f"Successfully processed document version {version_id}. "
            f"Created {len(chunks_with_embeddings)} chunks."
        )
        
        return {
            'status': 'success',
            'version_id': version_id,
            'chunks_created': len(chunks_with_embeddings)
        }
    
    except DocumentVersion.DoesNotExist:
        logger.error(f"DocumentVersion {version_id} not found")
        return {'status': 'error', 'message': 'Document version not found'}
    
    except Exception as exc:
        logger.error(f"Error processing document {version_id}: {str(exc)}")
        
        try:
            version = DocumentVersion.objects.get(id=version_id)
            version.processing_status = ProcessingStatus.FAILED
            version.error_message = str(exc)[:500]  # Limit error message length
            version.save()
        except:
            pass
        
        raise self.retry(exc=exc)


def extract_and_chunk_task(version_id: int) -> list[dict]:
    
    version = DocumentVersion.objects.get(id=version_id)
    processor = DocumentProcessingService()
    
    # Get file path
    file_path = version.file.path
    file_type = version.file_type
    
    logger.info(f"Extracting text from {file_path} ({file_type})")
    
    # Extract text
    text = processor.extract_text(file_path, file_type)
    
    if not text or len(text.strip()) < 10:
        raise ValueError("Document appears to be empty or text extraction failed")
    
    # Extract metadata
    metadata = processor.extract_metadata(text, file_type)
    
    chunks = processor.chunk_text(text, metadata)
    
    logger.info(f"Created {len(chunks)} chunks from document {version_id}")
    
    return chunks


def generate_embeddings_task(chunks_data: list[dict]) -> list[dict]:
    embedding_service = EmbeddingService()
    
    texts = [chunk['text'] for chunk in chunks_data]
    
    logger.info(f"Generating embeddings for {len(texts)} chunks")
    
    # Generate embeddings
    embeddings = embedding_service.generate_embeddings(texts)
    
    for i, chunk in enumerate(chunks_data):
        chunk['embedding'] = embeddings[i]
    
    return chunks_data


def save_chunks_to_db(version_id: int, chunks_data: list[dict]):

    version = DocumentVersion.objects.get(id=version_id)
    
    DocumentChunk.objects.filter(version=version).delete()
    
    chunks_to_create = []
    for chunk_data in chunks_data:
        chunks_to_create.append(
            DocumentChunk(
                version=version,
                chunk_index=chunk_data['chunk_index'],
                text=chunk_data['text'],
                embedding=chunk_data['embedding'],
                metadata=chunk_data['metadata']
            )
        )
    
    DocumentChunk.objects.bulk_create(chunks_to_create)
    
    logger.info(f"Saved {len(chunks_to_create)} chunks to database")


@shared_task
def cleanup_failed_uploads():

    from datetime import timedelta
    
    cutoff_time = timezone.now() - timedelta(hours=1)
    
    failed_versions = DocumentVersion.objects.filter(
        processing_status=ProcessingStatus.UPLOADED,
        created_at__lt=cutoff_time
    )
    
    count = failed_versions.update(
        processing_status=ProcessingStatus.FAILED,
        error_message="Processing timed out"
    )
    
    if count > 0:
        logger.info(f"Marked {count} stale uploads as failed")
    
    return {'cleaned_up': count}

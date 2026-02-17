import logging
from typing import List, Dict, Tuple
from django.conf import settings
from django.db.models import F
from pgvector.django import CosineDistance

from apps.documents.models import DocumentChunk, DocumentStatus
from .services import EmbeddingService

logger = logging.getLogger(__name__)


class VectorSearchService:
 
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.top_k = settings.VECTOR_SEARCH_CONFIG['TOP_K_RESULTS']
        self.similarity_threshold = settings.VECTOR_SEARCH_CONFIG['SIMILARITY_THRESHOLD']
    
    def search(
        self,
        query: str,
        user,
        top_k: int = None,
        department: str = None
    ) -> List[Dict]:
        
        if top_k is None:
            top_k = self.top_k
        
        #embedding for query
        logger.info(f"Generating embedding for query: {query[:100]}")
        query_embedding = self.embedding_service.generate_embeddings([query])[0]
        
        #base queryset with permission
        chunks = self._get_accessible_chunks(user, department)
        
        if not chunks.exists():
            logger.warning(f"No accessible chunks found for user {user.username}")
            return []
        
        # Vector similarity
        results = chunks.annotate(
            distance=CosineDistance('embedding', query_embedding)
        ).order_by('distance')[:top_k * 2]  # Get extra to filter by threshold
        
        search_results = []
        for chunk in results:
            similarity_score = 1 - chunk.distance
            
            if similarity_score < self.similarity_threshold:
                continue
            
            search_results.append({
                'chunk': chunk,
                'similarity_score': round(similarity_score, 4),
                'text': chunk.text,
                'document_title': chunk.document.title,
                'version_number': chunk.version.version_number,
                'chunk_index': chunk.chunk_index,
                'metadata': chunk.metadata
            })
            
            if len(search_results) >= top_k:
                break
        
        logger.info(
            f"Found {len(search_results)} chunks above threshold "
            f"({self.similarity_threshold}) for query"
        )
        
        return search_results
    
    def _get_accessible_chunks(self, user, department=None): 
        chunks = DocumentChunk.objects.select_related(
            'version',
            'version__document',
            'version__document__owner'
        ).filter(
            version__document__status=DocumentStatus.APPROVED,
            version__processing_status='READY'
        )
        
        if department:
            chunks = chunks.filter(version__document__department=department)
        
        return chunks
    
    def get_similarity_stats(self, results: List[Dict]) -> Dict:
        if not results:
            return {
                'count': 0,
                'avg_score': 0.0,
                'min_score': 0.0,
                'max_score': 0.0
            }
        
        scores = [r['similarity_score'] for r in results]
        
        return {
            'count': len(scores),
            'avg_score': round(sum(scores) / len(scores), 4),
            'min_score': round(min(scores), 4),
            'max_score': round(max(scores), 4)
        }

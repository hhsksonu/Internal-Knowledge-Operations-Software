"""
Vector Search Service for Semantic Similarity.

Uses pgvector to find relevant document chunks based on semantic similarity.
"""

import logging
from typing import List, Dict, Tuple
from django.conf import settings
from django.db.models import F
from pgvector.django import CosineDistance

from apps.documents.models import DocumentChunk, DocumentStatus
from .services import EmbeddingService

logger = logging.getLogger(__name__)


class VectorSearchService:
    """
    Service for semantic search over document chunks.
    
    How it works:
    1. Convert user question to embedding
    2. Find chunks with similar embeddings (cosine similarity)
    3. Filter by permissions
    4. Return top-k results
    """
    
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
        """
        Search for relevant document chunks.
        
        Args:
            query: User's question
            user: User making the query (for permissions)
            top_k: Number of results to return (overrides default)
            department: Filter by department (optional)
        
        Returns:
            List of dicts with chunk info and similarity scores
        
        Example return:
        [
            {
                'chunk': DocumentChunk object,
                'similarity_score': 0.89,
                'text': "...",
                'document_title': "...",
                'version_number': 3,
                'metadata': {...}
            },
            ...
        ]
        """
        
        if top_k is None:
            top_k = self.top_k
        
        # Step 1: Generate embedding for query
        logger.info(f"Generating embedding for query: {query[:100]}")
        query_embedding = self.embedding_service.generate_embeddings([query])[0]
        
        # Step 2: Build base queryset with permission filtering
        chunks = self._get_accessible_chunks(user, department)
        
        if not chunks.exists():
            logger.warning(f"No accessible chunks found for user {user.username}")
            return []
        
        # Step 3: Vector similarity search using pgvector
        # CosineDistance computes 1 - cosine_similarity
        # So lower distance = higher similarity
        results = chunks.annotate(
            distance=CosineDistance('embedding', query_embedding)
        ).order_by('distance')[:top_k * 2]  # Get extra to filter by threshold
        
        # Step 4: Convert distance to similarity score and filter
        # similarity = 1 - distance
        search_results = []
        for chunk in results:
            similarity_score = 1 - chunk.distance
            
            # Filter by threshold
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
            
            # Stop once we have enough results
            if len(search_results) >= top_k:
                break
        
        logger.info(
            f"Found {len(search_results)} chunks above threshold "
            f"({self.similarity_threshold}) for query"
        )
        
        return search_results
    
    def _get_accessible_chunks(self, user, department=None):
        """
        Get chunks user has permission to access.
        
        Permission rules:
        1. Only from APPROVED documents
        2. Only from READY versions (processed successfully)
        3. If department specified, only from that department
        
        Admins can access all departments.
        """
        
        # Base query: Only approved documents with processed chunks
        chunks = DocumentChunk.objects.select_related(
            'version',
            'version__document',
            'version__document__owner'
        ).filter(
            version__document__status=DocumentStatus.APPROVED,
            version__processing_status='READY'
        )
        
        # Filter by department if specified
        if department:
            chunks = chunks.filter(version__document__department=department)
        
        return chunks
    
    def get_similarity_stats(self, results: List[Dict]) -> Dict:
        """
        Calculate statistics about search results.
        
        Useful for debugging and quality monitoring.
        """
        
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

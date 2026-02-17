import time
import logging
from typing import List, Dict, Tuple
from django.conf import settings
from apps.core.exceptions import LLMServiceError, EmbeddingGenerationError

logger = logging.getLogger(__name__)


class EmbeddingService:
    # Handles embedding
    
    def __init__(self):
        self.provider = settings.LLM_CONFIG['PROVIDER']
        self.api_key = settings.LLM_CONFIG['API_KEY']
        self.model = settings.LLM_CONFIG['EMBEDDING_MODEL']
        self.dimension = settings.LLM_CONFIG['EMBEDDING_DIMENSION']
    
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        # Main entry 
        
        if not texts:
            return []
        
        try:
            if self.provider == 'openai':
                return self._generate_openai_embeddings(texts)
            elif self.provider == 'anthropic':
                return self._generate_openai_embeddings(texts)
            else:
                raise ValueError(f"Unsupported provider: {self.provider}")
        
        except Exception as e:
            logger.error(f"Embedding generation failed: {str(e)}")
            raise EmbeddingGenerationError(f"Failed to generate embeddings: {str(e)}")
    
    def _generate_openai_embeddings(self, texts: List[str]) -> List[List[float]]:
        # Replace with actual OpenAI embedding
        
        import random
        logger.warning("Using demo embeddings - replace with real API call")
        
        embeddings = []
        for text in texts:
            random.seed(hash(text) % (2**32))
            embedding = [random.random() for _ in range(self.dimension)]
            embeddings.append(embedding)
        
        return embeddings


class LLMService:
    
    def __init__(self):
        self.provider = settings.LLM_CONFIG['PROVIDER']
        self.api_key = settings.LLM_CONFIG['API_KEY']
        self.model = settings.LLM_CONFIG['MODEL']
    
    def generate_answer(
        self,
        question: str,
        context_chunks: List[Dict],
        max_tokens: int = None
    ) -> Tuple[str, int]:
        
        if not max_tokens:
            max_tokens = settings.RATE_LIMIT_CONFIG['MAX_TOKENS_PER_QUERY']
        
        prompt = self._build_rag_prompt(question, context_chunks)
        
        try:
            if self.provider == 'openai':
                answer, tokens = self._call_openai(prompt, max_tokens)
            elif self.provider == 'anthropic':
                answer, tokens = self._call_anthropic(prompt, max_tokens)
            else:
                raise ValueError(f"Unsupported provider: {self.provider}")
            
            return answer, tokens
        
        except Exception as e:
            logger.error(f"LLM generation failed: {str(e)}")
            raise LLMServiceError(f"Failed to generate answer: {str(e)}")
    
    def _build_rag_prompt(
        self,
        question: str,
        context_chunks: List[Dict]
    ) -> str:
        
        context_text = ""
        for i, chunk in enumerate(context_chunks, 1):
            doc_title = chunk.get('document_title', 'Unknown')
            chunk_text = chunk.get('text', '')
            context_text += f"\n[Source {i}: {doc_title}]\n{chunk_text}\n"
        
        prompt = f"""You are a helpful assistant that answers questions based on internal company documents.

CRITICAL RULES:
1. Answer ONLY using information from the provided sources below
2. If the answer is not in the sources, say "I don't have enough information to answer this question based on the available documents"
3. Never make up or infer information that isn't explicitly stated
4. Cite which source(s) you used (e.g., "According to Source 1...")
5. Be concise and direct

SOURCES:
{context_text}

QUESTION: {question}

ANSWER:"""
        
        return prompt
    
    def _call_openai(self, prompt: str, max_tokens: int) -> Tuple[str, int]:

        logger.warning("Using demo LLM response - replace with real API call")
        
        answer = """Based on the provided sources, I don't have enough specific information to fully answer your question. 

However, I can provide some general guidance based on what's available in the documents. For a more complete answer, please refer to Sources 1-3 for additional context.

[Demo response - replace with real LLM output]"""
        
        tokens = len(prompt.split()) + len(answer.split())
        
        return answer, tokens
    
    def _call_anthropic(self, prompt: str, max_tokens: int) -> Tuple[str, int]:
        
        logger.warning("Using demo LLM response - replace with real API call")
        return self._call_openai(prompt, max_tokens)

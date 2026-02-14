"""
LLM and Embedding Services.

These services abstract LLM provider calls (OpenAI, Anthropic, etc.).

Why abstract?
- Easy to switch providers
- Centralized error handling
- Rate limiting
- Token counting
- Prompt versioning
"""

import time
import logging
from typing import List, Dict, Tuple
from django.conf import settings
from apps.core.exceptions import LLMServiceError, EmbeddingGenerationError

logger = logging.getLogger(__name__)


class EmbeddingService:
    """
    Service for generating text embeddings.
    
    Embeddings convert text into vectors that can be compared
    for semantic similarity.
    
    Example:
        "What is AI?" and "Explain artificial intelligence"
        have similar embeddings despite different words.
    """
    
    def __init__(self):
        self.provider = settings.LLM_CONFIG['PROVIDER']
        self.api_key = settings.LLM_CONFIG['API_KEY']
        self.model = settings.LLM_CONFIG['EMBEDDING_MODEL']
        self.dimension = settings.LLM_CONFIG['EMBEDDING_DIMENSION']
    
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts.
        
        Args:
            texts: List of text strings to embed
        
        Returns:
            List of embedding vectors (each is a list of floats)
        
        Raises:
            EmbeddingGenerationError: If embedding generation fails
        
        Note: This batches texts for efficiency.
        Most providers support batch embedding.
        """
        
        if not texts:
            return []
        
        try:
            if self.provider == 'openai':
                return self._generate_openai_embeddings(texts)
            elif self.provider == 'anthropic':
                # Anthropic doesn't provide embeddings yet
                # You'd use a separate embedding service
                return self._generate_openai_embeddings(texts)
            else:
                raise ValueError(f"Unsupported provider: {self.provider}")
        
        except Exception as e:
            logger.error(f"Embedding generation failed: {str(e)}")
            raise EmbeddingGenerationError(f"Failed to generate embeddings: {str(e)}")
    
    def _generate_openai_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings using OpenAI API.
        
        Real implementation would use:
            import openai
            response = openai.Embedding.create(input=texts, model=self.model)
        
        For this demo, we'll show the structure without actual API calls.
        """
        
        # IMPORTANT: In production, replace this with actual OpenAI API calls
        # Example:
        # ```
        # import openai
        # openai.api_key = self.api_key
        # response = openai.Embedding.create(
        #     input=texts,
        #     model=self.model
        # )
        # return [item['embedding'] for item in response['data']]
        # ```
        
        # For demo purposes, return random vectors of correct dimension
        import random
        logger.warning("Using demo embeddings - replace with real OpenAI API in production")
        
        embeddings = []
        for text in texts:
            # Generate a consistent "fake" embedding based on text hash
            # This allows the demo to work without API keys
            random.seed(hash(text) % (2**32))
            embedding = [random.random() for _ in range(self.dimension)]
            embeddings.append(embedding)
        
        return embeddings


class LLMService:
    """
    Service for LLM-powered text generation.
    
    Handles:
    - Prompt construction
    - Provider API calls
    - Token counting
    - Error handling
    """
    
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
        """
        Generate an answer to a question using provided context.
        
        Args:
            question: User's question
            context_chunks: List of relevant document chunks
            max_tokens: Maximum tokens to generate
        
        Returns:
            Tuple of (answer, tokens_used)
        
        This is the core RAG function:
        1. Build prompt with context
        2. Call LLM
        3. Extract answer
        4. Count tokens
        """
        
        if not max_tokens:
            max_tokens = settings.RATE_LIMIT_CONFIG['MAX_TOKENS_PER_QUERY']
        
        # Build the prompt
        prompt = self._build_rag_prompt(question, context_chunks)
        
        # Call LLM
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
        """
        Build a RAG prompt with strict instructions.
        
        Critical rules for the LLM:
        1. Answer ONLY from provided context
        2. If answer not in context, say so
        3. Cite sources
        4. Don't make up information
        
        This is prompt engineering - the quality of this prompt
        directly affects answer quality.
        """
        
        # Format context chunks
        context_text = ""
        for i, chunk in enumerate(context_chunks, 1):
            doc_title = chunk.get('document_title', 'Unknown')
            chunk_text = chunk.get('text', '')
            context_text += f"\n[Source {i}: {doc_title}]\n{chunk_text}\n"
        
        # Build the prompt
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
        """
        Call OpenAI API.
        
        Real implementation:
        ```
        import openai
        response = openai.ChatCompletion.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=0.3  # Lower = more focused
        )
        answer = response.choices[0].message.content
        tokens = response.usage.total_tokens
        return answer, tokens
        ```
        """
        
        # DEMO ONLY - Replace with real API call
        logger.warning("Using demo LLM response - replace with real OpenAI API in production")
        
        answer = """Based on the provided sources, I don't have enough specific information to fully answer your question. 

However, I can provide some general guidance based on what's available in the documents. For a more complete answer, please refer to Sources 1-3 for additional context.

[This is a demo response - in production, this would be a real LLM-generated answer based on your documents]"""
        
        # Estimate tokens (rough approximation)
        tokens = len(prompt.split()) + len(answer.split())
        
        return answer, tokens
    
    def _call_anthropic(self, prompt: str, max_tokens: int) -> Tuple[str, int]:
        """
        Call Anthropic API.
        
        Real implementation:
        ```
        import anthropic
        client = anthropic.Anthropic(api_key=self.api_key)
        response = client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}]
        )
        answer = response.content[0].text
        tokens = response.usage.input_tokens + response.usage.output_tokens
        return answer, tokens
        ```
        """
        
        # DEMO ONLY
        logger.warning("Using demo LLM response - replace with real Anthropic API in production")
        return self._call_openai(prompt, max_tokens)  # Use same demo for now

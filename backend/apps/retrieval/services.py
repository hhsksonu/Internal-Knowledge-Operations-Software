import time
import logging
import requests
from typing import List, Dict, Tuple
from django.conf import settings
from apps.core.exceptions import LLMServiceError, EmbeddingGenerationError

logger = logging.getLogger(__name__)


class EmbeddingServiceHF:
    """
    Handles embedding generation using Hugging Face Router API.
    Provider: Hugging Face
    Model: BAAI/bge-base-en-v1.5
    Task: feature-extraction
    Used for: Document chunk embeddings and query embeddings for vector search
    """

    def __init__(self):
        self.provider = "huggingface"
        self.model = "BAAI/bge-base-en-v1.5"
        self.api_key = settings.HF_EMBEDDING_API_KEY
        # Updated Router URL for feature extraction
        self.api_url = f"https://router.huggingface.co/hf-inference/models/{self.model}/pipeline/feature-extraction"
        self.dimension = 768  # BGE-base-en output dimension
        
        if not self.api_key:
            raise ValueError("HF_EMBEDDING_API_KEY not found in environment variables")
        
        logger.info(f"EmbeddingServiceHF initialized with model: {self.model}")

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Main entry point for embedding generation.
        Generates fixed-size float vectors suitable for cosine similarity.
        """
        if not texts:
            return []

        try:
            logger.info(f"Generating embeddings for {len(texts)} texts using {self.model}")
            embeddings = self._call_huggingface_embedding_api(texts)
            logger.info(f"Successfully generated {len(embeddings)} embeddings (dim={self.dimension})")
            return embeddings

        except Exception as e:
            logger.error(f"Embedding generation failed: {str(e)}")
            raise EmbeddingGenerationError(f"Failed to generate embeddings: {str(e)}")

    def _call_huggingface_embedding_api(self, texts: List[str]) -> List[List[float]]:
        """
        Call Hugging Face Router API for embedding generation.
        Uses the new feature-extraction pipeline endpoint.
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "inputs": texts,
            "options": {
                "wait_for_model": True,
                "use_cache": True
            }
        }
        
        try:
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=30
            )
            
            # Handle rate limiting
            if response.status_code == 429:
                error_data = response.json()
                logger.error(f"HF API rate limit exceeded: {error_data}")
                raise EmbeddingGenerationError(
                    "Hugging Face API rate limit exceeded. Please try again in a few moments."
                )
            
            # Handle quota exceeded
            if response.status_code == 403:
                error_data = response.json()
                logger.error(f"HF API quota exceeded: {error_data}")
                raise EmbeddingGenerationError(
                    "Hugging Face API quota exceeded. Please check your billing."
                )
            
            # Handle other errors
            if response.status_code != 200:
                error_msg = response.text
                logger.error(f"HF API error (status {response.status_code}): {error_msg}")
                raise EmbeddingGenerationError(
                    f"Hugging Face API error: {error_msg}"
                )
            
            # Parse response
            embeddings = response.json()
            
            # Validate output format
            if not isinstance(embeddings, list):
                raise ValueError(f"Unexpected response format: {type(embeddings)}")
            
            # If single text, wrap in list
            if len(texts) == 1 and isinstance(embeddings[0], (int, float)):
                embeddings = [embeddings]
            
            logger.info(f"Provider: {self.provider}, Model: {self.model}, Embeddings generated: {len(embeddings)}")
            
            return embeddings
            
        except requests.exceptions.Timeout:
            logger.error("HF API timeout")
            raise EmbeddingGenerationError("Hugging Face API request timed out")
        
        except requests.exceptions.RequestException as e:
            logger.error(f"HF API request failed: {str(e)}")
            raise EmbeddingGenerationError(f"Failed to connect to Hugging Face API: {str(e)}")


class GenerationServiceHF:
    """
    Handles LLM-based answer generation using Hugging Face Router API.
    Provider: Hugging Face
    Model: mistralai/Mistral-7B-Instruct-v0.2
    Task: chat-completions (OpenAI-compatible)
    Used for: Generating final answers from retrieved context chunks
    """

    def __init__(self):
        self.provider = "huggingface"
        self.model = "mistralai/Mistral-7B-Instruct-v0.2"
        self.api_key = settings.HF_LLM_API_KEY
        # OpenAI-compatible chat completions endpoint
        self.api_url = "https://router.huggingface.co/v1/chat/completions"
        
        if not self.api_key:
            raise ValueError("HF_LLM_API_KEY not found in environment variables")
        
        logger.info(f"GenerationServiceHF initialized with model: {self.model}")

    def generate_answer(
        self,
        question: str,
        context_chunks: List[Dict],
        max_tokens: int = None
    ) -> Tuple[str, int]:
        """
        Generate answer using RAG approach with Mistral-7B-Instruct.
        Returns: (answer_text, tokens_used)
        """
        if not max_tokens:
            max_tokens = settings.RATE_LIMIT_CONFIG.get('MAX_TOKENS_PER_QUERY', 500)

        prompt = self._build_rag_prompt(question, context_chunks)

        try:
            logger.info(f"Generating answer using {self.model}")
            answer, tokens = self._call_huggingface_generation_api(prompt, max_tokens)
            logger.info(f"Successfully generated answer ({tokens} tokens used)")
            return answer, tokens

        except Exception as e:
            logger.error(f"Answer generation failed: {str(e)}")
            raise LLMServiceError(f"Failed to generate answer: {str(e)}")

    def _build_rag_prompt(self, question: str, context_chunks: List[Dict]) -> str:
        """
        Build RAG prompt with context.
        The system message is passed separately in the API call.
        """
        # Build context from chunks
        context_text = ""
        for i, chunk in enumerate(context_chunks, 1):
            doc_title = chunk.get('document_title', 'Unknown')
            chunk_text = chunk.get('text', '')
            context_text += f"\n[Source {i}: {doc_title}]\n{chunk_text}\n"

        # Construct user message with context
        prompt = f"""CONTEXT:
{context_text}

QUESTION:
{question}

Please provide a clear, accurate answer based only on the context above. Cite which source(s) you used."""

        return prompt

    def _call_huggingface_generation_api(
        self,
        prompt: str,
        max_tokens: int
    ) -> Tuple[str, int]:
        """
        Call Hugging Face Router API for text generation.
        Uses OpenAI-compatible chat completions endpoint.
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a professional assistant that answers questions based on internal company documents. CRITICAL RULES: 1) Answer ONLY using information from the provided context. 2) If the answer is not in the context, say 'I don't have enough information to answer this question.' 3) Never make up information. 4) Cite which source(s) you used. 5) Be concise and direct."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.1,  # Low temperature for factual accuracy
            "max_tokens": max_tokens
        }
        
        try:
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=60
            )
            
            # Handle rate limiting
            if response.status_code == 429:
                error_data = response.json()
                logger.error(f"HF API rate limit exceeded: {error_data}")
                raise LLMServiceError(
                    "Hugging Face API rate limit exceeded. Please try again in a few moments."
                )
            
            # Handle quota exceeded
            if response.status_code == 403:
                error_data = response.json()
                logger.error(f"HF API quota exceeded: {error_data}")
                raise LLMServiceError(
                    "Hugging Face API quota exceeded. Please check your billing."
                )
            
            # Handle other errors
            if response.status_code != 200:
                error_msg = response.text
                logger.error(f"HF API error (status {response.status_code}): {error_msg}")
                raise LLMServiceError(
                    f"Hugging Face API error: {error_msg}"
                )
            
            # Parse OpenAI-compatible response
            result = response.json()
            answer = result['choices'][0]['message']['content'].strip()
            
            # Get token usage from response (OpenAI-compatible format)
            if 'usage' in result:
                total_tokens = result['usage']['total_tokens']
            else:
                # Fallback: estimate tokens
                input_tokens = len(prompt.split())
                output_tokens = len(answer.split())
                total_tokens = input_tokens + output_tokens
            
            logger.info(
                f"Provider: {self.provider}, Model: {self.model}, "
                f"Tokens: {total_tokens}"
            )
            
            return answer, total_tokens
            
        except requests.exceptions.Timeout:
            logger.error("HF API timeout")
            raise LLMServiceError("Hugging Face API request timed out")
        
        except requests.exceptions.RequestException as e:
            logger.error(f"HF API request failed: {str(e)}")
            raise LLMServiceError(f"Failed to connect to Hugging Face API: {str(e)}")


# Backward compatibility aliases (maintain existing interface)
EmbeddingService = EmbeddingServiceHF
LLMService = GenerationServiceHF
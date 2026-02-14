"""
Custom Exception Handler for REST API.

Provides consistent error responses across the application.
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides consistent error responses.
    
    Standard error response format:
    {
        "error": "Error type",
        "message": "Human-readable error message",
        "details": {...}  # Optional additional details
    }
    """
    
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Customize the response format
        custom_response_data = {
            'error': exc.__class__.__name__,
            'message': str(exc),
        }
        
        # Add details if available
        if hasattr(exc, 'detail'):
            custom_response_data['details'] = exc.detail
        
        response.data = custom_response_data
    
    return response


class RateLimitExceeded(Exception):
    """Raised when user exceeds their query quota"""
    pass


class DocumentProcessingError(Exception):
    """Raised when document processing fails"""
    pass


class EmbeddingGenerationError(Exception):
    """Raised when embedding generation fails"""
    pass


class LLMServiceError(Exception):
    """Raised when LLM service encounters an error"""
    pass

"""
Retrieval Models for RAG System.

This module defines:
1. Query - Store user questions and LLM responses
2. QuerySource - Track which document chunks were used
3. Feedback - Human feedback on query quality
"""

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Query(models.Model):
    """
    User Query and Response Storage.
    
    Why store queries?
    - Analytics: What are users asking?
    - Cost tracking: Token usage
    - Debugging: What went wrong?
    - Training data: For improving the system
    
    Fields:
    - question: What the user asked
    - answer: LLM's response
    - context_used: The document chunks provided to LLM
    - sources: References to chunks used (see QuerySource)
    - tokens_used: For cost calculation
    - response_time: Performance monitoring
    """
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='queries',
        help_text="User who asked the question"
    )
    
    question = models.TextField(
        help_text="User's question"
    )
    
    answer = models.TextField(
        help_text="LLM-generated answer"
    )
    
    # Context provided to LLM
    context_used = models.TextField(
        help_text="Document chunks provided to LLM as context"
    )
    
    # Metadata
    tokens_used = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Total tokens (input + output)"
    )
    
    response_time_ms = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Response time in milliseconds"
    )
    
    # Was the answer satisfactory?
    was_successful = models.BooleanField(
        default=True,
        help_text="Whether an answer was generated (False if no relevant docs)"
    )
    
    # Search metadata
    num_chunks_retrieved = models.IntegerField(
        default=0,
        help_text="Number of chunks retrieved from vector search"
    )
    
    avg_similarity_score = models.FloatField(
        default=0.0,
        help_text="Average similarity score of retrieved chunks"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'queries'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['was_successful']),
        ]
    
    def __str__(self):
        return f"Query by {self.user.username}: {self.question[:50]}..."


class QuerySource(models.Model):
    """
    Source Attribution for Queries.
    
    Links a query to the specific document chunks that were used.
    
    Why separate table?
    - One query can use multiple chunks
    - Need to track which chunk contributed what
    - Enables source citation in UI
    """
    
    query = models.ForeignKey(
        Query,
        on_delete=models.CASCADE,
        related_name='sources',
        help_text="The query this source was used for"
    )
    
    chunk = models.ForeignKey(
        'documents.DocumentChunk',
        on_delete=models.CASCADE,
        related_name='used_in_queries',
        help_text="The document chunk used as source"
    )
    
    similarity_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Similarity score from vector search"
    )
    
    rank = models.IntegerField(
        help_text="Rank in search results (1 = most relevant)"
    )
    
    class Meta:
        db_table = 'query_sources'
        ordering = ['query', 'rank']
        indexes = [
            models.Index(fields=['query', 'rank']),
        ]
    
    def __str__(self):
        return f"Source {self.rank} for query {self.query.id}"


class FeedbackType(models.TextChoices):
    """
    Types of feedback users can provide.
    
    HELPFUL - Answer was useful
    NOT_HELPFUL - Answer was not useful
    HALLUCINATION - LLM made up information
    MISSING_INFO - Answer incomplete
    WRONG_SOURCE - Used incorrect documents
    """
    HELPFUL = 'HELPFUL', 'Helpful'
    NOT_HELPFUL = 'NOT_HELPFUL', 'Not Helpful'
    HALLUCINATION = 'HALLUCINATION', 'Hallucination Detected'
    MISSING_INFO = 'MISSING_INFO', 'Missing Information'
    WRONG_SOURCE = 'WRONG_SOURCE', 'Wrong Source Used'


class Feedback(models.Model):
    """
    User Feedback on Query Quality.
    
    Why collect feedback?
    - Quality monitoring: Track LLM performance
    - Training data: Improve prompts and retrieval
    - Identify problem areas: What topics need better docs?
    
    Human-in-the-loop is crucial for maintaining quality.
    """
    
    query = models.ForeignKey(
        Query,
        on_delete=models.CASCADE,
        related_name='feedback',
        help_text="The query being rated"
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='feedback_given',
        help_text="User providing feedback"
    )
    
    feedback_type = models.CharField(
        max_length=20,
        choices=FeedbackType.choices,
        help_text="Type of feedback"
    )
    
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True,
        help_text="Rating 1-5 (optional)"
    )
    
    comment = models.TextField(
        blank=True,
        help_text="Optional comment explaining the feedback"
    )
    
    # For hallucination reports
    hallucinated_text = models.TextField(
        blank=True,
        help_text="Text that appears to be hallucinated"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Has this been reviewed by a content owner/reviewer?
    is_reviewed = models.BooleanField(
        default=False,
        help_text="Whether a reviewer has looked at this"
    )
    
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='feedback_reviewed',
        help_text="Who reviewed this feedback"
    )
    
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this was reviewed"
    )
    
    class Meta:
        db_table = 'feedback'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['query']),
            models.Index(fields=['feedback_type']),
            models.Index(fields=['is_reviewed']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_feedback_type_display()} on query {self.query.id}"

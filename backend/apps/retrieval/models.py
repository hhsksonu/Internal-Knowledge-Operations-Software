from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Query(models.Model):
    # Stores every user question + LLM response
    # Useful for analytics, cost tracking, debugging
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='queries',
    )
    
    question = models.TextField()
    
    answer = models.TextField()
    
    # Raw context sent to LLM
    context_used = models.TextField()
    
    # Token usage
    tokens_used = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
    )
    
    # Time taken to generate answer
    response_time_ms = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
    )
    
    # False if no relevant docs found
    was_successful = models.BooleanField(
        default=True,
    )
    
    num_chunks_retrieved = models.IntegerField(
        default=0,
    )
    
    avg_similarity_score = models.FloatField(
        default=0.0,
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
    # Links query 
    
    query = models.ForeignKey(
        Query,
        on_delete=models.CASCADE,
        related_name='sources',
    )
    
    chunk = models.ForeignKey(
        'documents.DocumentChunk',
        on_delete=models.CASCADE,
        related_name='used_in_queries',
    )
    
    # Similarity score
    similarity_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
    )
    
    # Rank in retrieval results
    rank = models.IntegerField()
    
    class Meta:
        db_table = 'query_sources'
        ordering = ['query', 'rank']
        indexes = [
            models.Index(fields=['query', 'rank']),
        ]
    
    def __str__(self):
        return f"Source {self.rank} for query {self.query.id}"


class FeedbackType(models.TextChoices):
    # Different types of feedback 
    
    HELPFUL = 'HELPFUL', 'Helpful'
    NOT_HELPFUL = 'NOT_HELPFUL', 'Not Helpful'
    HALLUCINATION = 'HALLUCINATION', 'Hallucination Detected'
    MISSING_INFO = 'MISSING_INFO', 'Missing Information'
    WRONG_SOURCE = 'WRONG_SOURCE', 'Wrong Source Used'


class Feedback(models.Model):
    # Stores user feedback
    
    query = models.ForeignKey(
        Query,
        on_delete=models.CASCADE,
        related_name='feedback',
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='feedback_given',
    )
    
    feedback_type = models.CharField(
        max_length=20,
        choices=FeedbackType.choices,
    )
    
    # rating 
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True,
    )
    
    comment = models.TextField(blank=True)
    
    hallucinated_text = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    is_reviewed = models.BooleanField(
        default=False,
    )
    
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='feedback_reviewed',
    )
    
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
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

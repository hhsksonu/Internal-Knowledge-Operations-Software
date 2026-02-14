"""
Serializers for Retrieval API.
"""

from rest_framework import serializers
from .models import Query, QuerySource, Feedback, FeedbackType
from apps.documents.serializers import DocumentChunkSerializer


class QuerySourceSerializer(serializers.ModelSerializer):
    """
    Serializer for query sources (source attribution).
    """
    
    chunk = DocumentChunkSerializer(read_only=True)
    
    class Meta:
        model = QuerySource
        fields = ['id', 'chunk', 'similarity_score', 'rank']


class QuerySerializer(serializers.ModelSerializer):
    """
    Serializer for query results.
    """
    
    user_username = serializers.CharField(source='user.username', read_only=True)
    sources = QuerySourceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Query
        fields = [
            'id', 'user', 'user_username', 'question', 'answer',
            'sources', 'tokens_used', 'response_time_ms',
            'was_successful', 'num_chunks_retrieved',
            'avg_similarity_score', 'created_at'
        ]
        read_only_fields = [
            'user', 'answer', 'tokens_used', 'response_time_ms',
            'was_successful', 'num_chunks_retrieved',
            'avg_similarity_score', 'created_at'
        ]


class QueryRequestSerializer(serializers.Serializer):
    """
    Serializer for query request.
    
    POST /api/retrieval/query/
    {
        "question": "What is our remote work policy?",
        "department": "HR"  // optional
    }
    """
    
    question = serializers.CharField(
        max_length=1000,
        help_text="Your question"
    )
    
    department = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
        help_text="Filter by department (optional)"
    )
    
    def validate_question(self, value):
        """
        Validate question is not empty or too short.
        """
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Question must be at least 10 characters long."
            )
        return value.strip()


class FeedbackSerializer(serializers.ModelSerializer):
    """
    Serializer for feedback.
    """
    
    user_username = serializers.CharField(source='user.username', read_only=True)
    reviewed_by_username = serializers.CharField(
        source='reviewed_by.username',
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = Feedback
        fields = [
            'id', 'query', 'user', 'user_username', 'feedback_type',
            'rating', 'comment', 'hallucinated_text', 'created_at',
            'is_reviewed', 'reviewed_by_username', 'reviewed_at'
        ]
        read_only_fields = [
            'user', 'created_at', 'is_reviewed',
            'reviewed_by_username', 'reviewed_at'
        ]


class FeedbackCreateSerializer(serializers.Serializer):
    """
    Serializer for creating feedback.
    
    POST /api/retrieval/feedback/
    {
        "query_id": 123,
        "feedback_type": "HELPFUL",
        "rating": 5,
        "comment": "Very helpful answer!"
    }
    """
    
    query_id = serializers.IntegerField()
    feedback_type = serializers.ChoiceField(choices=FeedbackType.choices)
    rating = serializers.IntegerField(
        min_value=1,
        max_value=5,
        required=False,
        allow_null=True
    )
    comment = serializers.CharField(
        max_length=1000,
        required=False,
        allow_blank=True
    )
    hallucinated_text = serializers.CharField(
        max_length=2000,
        required=False,
        allow_blank=True
    )
    
    def validate_query_id(self, value):
        """
        Validate query exists.
        """
        try:
            Query.objects.get(id=value)
        except Query.DoesNotExist:
            raise serializers.ValidationError("Query not found.")
        return value
    
    def validate(self, attrs):
        """
        Validate that hallucinated_text is provided for HALLUCINATION feedback.
        """
        if attrs.get('feedback_type') == FeedbackType.HALLUCINATION:
            if not attrs.get('hallucinated_text'):
                raise serializers.ValidationError({
                    'hallucinated_text': "Please provide the hallucinated text."
                })
        return attrs

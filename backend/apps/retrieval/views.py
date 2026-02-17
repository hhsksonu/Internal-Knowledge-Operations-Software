import time
import logging
from rest_framework import status, generics, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import transaction

from .models import Query, QuerySource, Feedback
from .serializers import (
    QuerySerializer,
    QueryRequestSerializer,
    FeedbackSerializer,
    FeedbackCreateSerializer
)
from .vector_search import VectorSearchService
from .services import LLMService
from apps.core.permissions import CanQuery, IsReviewer
from apps.core.exceptions import RateLimitExceeded
from apps.audit.services import AuditService

logger = logging.getLogger(__name__)


class QueryView(views.APIView):
    permission_classes = [IsAuthenticated, CanQuery]
    
    @transaction.atomic
    def post(self, request):
        # Validate request
        serializer = QueryRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        question = serializer.validated_data['question']
        department = serializer.validated_data.get('department')
        
        logger.info(f"Processing query from user {request.user.username}: {question[:100]}")
        
        start_time = time.time()
        
        try:
            # Vector search for chunks
            vector_search = VectorSearchService()
            search_results = vector_search.search(
                query=question,
                user=request.user,
                department=department
            )
            
            if not search_results:
                # No documents found
                return self._handle_no_results(request.user, question)
            
            #generate answer using LLM
            llm_service = LLMService()
            answer, tokens_used = llm_service.generate_answer(
                question=question,
                context_chunks=search_results
            )
            
            #calculate stats
            response_time_ms = int((time.time() - start_time) * 1000)
            similarity_stats = vector_search.get_similarity_stats(search_results)
            
            #save query 
            query = Query.objects.create(
                user=request.user,
                question=question,
                answer=answer,
                context_used=self._format_context(search_results),
                tokens_used=tokens_used,
                response_time_ms=response_time_ms,
                was_successful=True,
                num_chunks_retrieved=len(search_results),
                avg_similarity_score=similarity_stats['avg_score']
            )
            
            # save source 
            sources = []
            for rank, result in enumerate(search_results, 1):
                source = QuerySource.objects.create(
                    query=query,
                    chunk=result['chunk'],
                    similarity_score=result['similarity_score'],
                    rank=rank
                )
                sources.append(source)
            
            # update user query
            request.user.increment_query_count()
            request.user.add_token_usage(tokens_used)
            
            # log audit
            AuditService.log_action(
                user=request.user,
                action='QUERY_EXECUTED',
                resource_type='Query',
                resource_id=query.id,
                details={
                    'question_preview': question[:100],
                    'num_sources': len(sources),
                    'tokens_used': tokens_used,
                    'response_time_ms': response_time_ms
                },
                request=request
            )
            
            # return response
            return Response({
                'query_id': query.id,
                'question': question,
                'answer': answer,
                'sources': [
                    {
                        'chunk_id': result['chunk'].id,
                        'document_title': result['document_title'],
                        'version_number': result['version_number'],
                        'text': result['text'],
                        'similarity_score': result['similarity_score'],
                        'rank': rank,
                        'metadata': result['metadata']
                    }
                    for rank, result in enumerate(search_results, 1)
                ],
                'tokens_used': tokens_used,
                'response_time_ms': response_time_ms,
                'num_chunks_retrieved': len(search_results),
                'avg_similarity_score': similarity_stats['avg_score']
            }, status=status.HTTP_200_OK)
        
        except RateLimitExceeded as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        except Exception as e:
            logger.error(f"Query processing error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'An error occurred processing your query. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _handle_no_results(self, user, question):
        #query for analytics
        query = Query.objects.create(
            user=user,
            question=question,
            answer="I don't have enough information to answer this question based on the available documents.",
            context_used="",
            tokens_used=0,
            response_time_ms=0,
            was_successful=False,
            num_chunks_retrieved=0,
            avg_similarity_score=0.0
        )
        
        return Response({
            'query_id': query.id,
            'question': question,
            'answer': query.answer,
            'sources': [],
            'tokens_used': 0,
            'response_time_ms': 0,
            'message': 'No relevant documents found. Consider uploading documents related to your question.'
        }, status=status.HTTP_200_OK)
    
    def _format_context(self, search_results):
        context_parts = []
        for result in search_results:
            context_parts.append(
                f"[{result['document_title']} v{result['version_number']}]\n"
                f"{result['text']}\n"
            )
        return "\n\n".join(context_parts)


class QueryHistoryView(generics.ListAPIView):
    
    serializer_class = QuerySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Query.objects.filter(user=user).prefetch_related('sources')
        
        # Search filter
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(question__icontains=search) |
                models.Q(answer__icontains=search)
            )
        
        return queryset.order_by('-created_at')


class QueryDetailView(generics.RetrieveAPIView):
    serializer_class = QuerySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):

        if self.request.user.is_admin():
            return Query.objects.all()
        return Query.objects.filter(user=self.request.user)


class FeedbackCreateView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = FeedbackCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            # Get the query
            query = Query.objects.get(id=serializer.validated_data['query_id'])
            
            # Check if user already provided feedback for this query
            existing_feedback = Feedback.objects.filter(
                query=query,
                user=request.user
            ).first()
            
            if existing_feedback:
                return Response(
                    {'error': 'You have already provided feedback for this query.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create feedback
            feedback = Feedback.objects.create(
                query=query,
                user=request.user,
                feedback_type=serializer.validated_data['feedback_type'],
                rating=serializer.validated_data.get('rating'),
                comment=serializer.validated_data.get('comment', ''),
                hallucinated_text=serializer.validated_data.get('hallucinated_text', '')
            )
            
            # Log action
            AuditService.log_action(
                user=request.user,
                action='FEEDBACK_SUBMITTED',
                resource_type='Feedback',
                resource_id=feedback.id,
                details={
                    'query_id': query.id,
                    'feedback_type': feedback.feedback_type,
                    'rating': feedback.rating
                }
            )
            
            return Response({
                'message': 'Feedback submitted successfully',
                'feedback': FeedbackSerializer(feedback).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class FeedbackListView(generics.ListAPIView):
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated, IsReviewer]
    
    def get_queryset(self):
        queryset = Feedback.objects.select_related('user', 'query', 'reviewed_by')
        
        # Filter by type
        feedback_type = self.request.query_params.get('feedback_type')
        if feedback_type:
            queryset = queryset.filter(feedback_type=feedback_type)
        
        # Filter by review status
        is_reviewed = self.request.query_params.get('is_reviewed')
        if is_reviewed is not None:
            is_reviewed_bool = is_reviewed.lower() == 'true'
            queryset = queryset.filter(is_reviewed=is_reviewed_bool)
        
        return queryset.order_by('-created_at')


class FeedbackReviewView(views.APIView):

    permission_classes = [IsAuthenticated, IsReviewer]
    
    def post(self, request, pk):
        try:
            feedback = Feedback.objects.get(pk=pk)
        except Feedback.DoesNotExist:
            return Response(
                {'error': 'Feedback not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        feedback.is_reviewed = True
        feedback.reviewed_by = request.user
        feedback.reviewed_at = timezone.now()
        feedback.save()
        
        return Response({
            'message': 'Feedback marked as reviewed',
            'feedback': FeedbackSerializer(feedback).data
        }, status=status.HTTP_200_OK)

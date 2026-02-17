from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import timedelta

from apps.retrieval.models import Query, Feedback, FeedbackType
from apps.documents.models import Document, DocumentStatus, ProcessingStatus
from apps.core.models import User
from apps.core.permissions import IsAdmin


class SystemStatsView(views.APIView):
    
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request):
        # document stats
        total_documents = Document.objects.count()
        approved_documents = Document.objects.filter(status=DocumentStatus.APPROVED).count()
        pending_documents = Document.objects.filter(status=DocumentStatus.DRAFT).count()
        
        #query stats
        total_queries = Query.objects.count()
        successful_queries = Query.objects.filter(was_successful=True).count()
        failed_queries = Query.objects.filter(was_successful=False).count()
        
        #token usage
        total_tokens = Query.objects.aggregate(Sum('tokens_used'))['tokens_used__sum'] or 0
        
        # User stats
        total_users = User.objects.filter(is_active=True).count()
        
        # Feedback stats
        total_feedback = Feedback.objects.count()
        helpful_feedback = Feedback.objects.filter(feedback_type=FeedbackType.HELPFUL).count()
        hallucination_reports = Feedback.objects.filter(feedback_type=FeedbackType.HALLUCINATION).count()
        
        return Response({
            'documents': {
                'total': total_documents,
                'approved': approved_documents,
                'pending': pending_documents,
            },
            'queries': {
                'total': total_queries,
                'successful': successful_queries,
                'failed': failed_queries,
                'success_rate': round(successful_queries / total_queries * 100, 2) if total_queries > 0 else 0,
            },
            'tokens': {
                'total_used': total_tokens,
            },
            'users': {
                'total_active': total_users,
            },
            'feedback': {
                'total': total_feedback,
                'helpful': helpful_feedback,
                'hallucination_reports': hallucination_reports,
            }
        })


class QueryAnalyticsView(views.APIView):
    
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request):
        days = int(request.query_params.get('days', 30))
        since = timezone.now() - timedelta(days=days)
        
        queries = Query.objects.filter(created_at__gte=since)
        
        #overall stats
        total = queries.count()
        successful = queries.filter(was_successful=True).count()
        
        #average response time
        avg_response_time = queries.aggregate(Avg('response_time_ms'))['response_time_ms__avg'] or 0
        
        # Average tokens per query
        avg_tokens = queries.aggregate(Avg('tokens_used'))['tokens_used__avg'] or 0
        
        # Average similarity score
        avg_similarity = queries.aggregate(Avg('avg_similarity_score'))['avg_similarity_score__avg'] or 0
        
        # Top users by query count
        top_users = queries.values('user__username').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # Queries by day
        queries_by_day = []
        for i in range(days):
            day = timezone.now() - timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            count = queries.filter(
                created_at__gte=day_start,
                created_at__lt=day_end
            ).count()
            
            queries_by_day.append({
                'date': day_start.strftime('%Y-%m-%d'),
                'count': count
            })
        
        return Response({
            'period_days': days,
            'total_queries': total,
            'successful_queries': successful,
            'success_rate': round(successful / total * 100, 2) if total > 0 else 0,
            'avg_response_time_ms': round(avg_response_time, 2),
            'avg_tokens_per_query': round(avg_tokens, 2),
            'avg_similarity_score': round(avg_similarity, 4),
            'top_users': list(top_users),
            'queries_by_day': list(reversed(queries_by_day)),
        })


class UserAnalyticsView(views.APIView):
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Query stats
        total_queries = Query.objects.filter(user=user).count()
        queries_today = Query.objects.filter(
            user=user,
            created_at__gte=timezone.now().replace(hour=0, minute=0, second=0)
        ).count()
        
        # Token usage
        total_tokens = user.total_tokens_used
        
        # Feedback given
        feedback_given = Feedback.objects.filter(user=user).count()
        
        # Recent queries
        recent_queries = Query.objects.filter(user=user).order_by('-created_at')[:5]
        recent_queries_data = [
            {
                'id': q.id,
                'question': q.question,
                'was_successful': q.was_successful,
                'created_at': q.created_at,
            }
            for q in recent_queries
        ]
        
        return Response({
            'queries': {
                'total': total_queries,
                'today': queries_today,
                'remaining_today': max(0, 100 - user.daily_query_count),  # Assuming 100 limit
            },
            'tokens_used': total_tokens,
            'feedback_given': feedback_given,
            'recent_queries': recent_queries_data,
        })

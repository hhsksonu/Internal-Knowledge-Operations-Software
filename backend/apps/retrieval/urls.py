from django.urls import path
from .views import (
    QueryView,
    QueryHistoryView,
    QueryDetailView,
    FeedbackCreateView,
    FeedbackListView,
    FeedbackReviewView
)

app_name = 'retrieval'

urlpatterns = [
    path('query/', QueryView.as_view(), name='query'),
    path('queries/', QueryHistoryView.as_view(), name='query-history'),
    path('queries/<int:pk>/', QueryDetailView.as_view(), name='query-detail'),
    
    path('feedback/', FeedbackCreateView.as_view(), name='feedback-create'),
    path('feedback/list/', FeedbackListView.as_view(), name='feedback-list'),
    path('feedback/<int:pk>/review/', FeedbackReviewView.as_view(), name='feedback-review'),
]

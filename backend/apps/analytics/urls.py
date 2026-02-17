
from django.urls import path
from .views import SystemStatsView, QueryAnalyticsView, UserAnalyticsView

app_name = 'analytics'

urlpatterns = [
    path('stats/', SystemStatsView.as_view(), name='stats'),
    path('queries/', QueryAnalyticsView.as_view(), name='query-analytics'),
    path('me/', UserAnalyticsView.as_view(), name='user-analytics'),
]

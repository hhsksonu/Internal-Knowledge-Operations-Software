from django.urls import path
from .views import (
    DocumentUploadView,
    DocumentListView,
    DocumentDetailView,
    DocumentApprovalView,
    DocumentNewVersionView,
    DocumentProcessingStatusView
)

app_name = 'documents'

urlpatterns = [
    path('upload/', DocumentUploadView.as_view(), name='upload'),
    path('', DocumentListView.as_view(), name='list'),
    path('<int:pk>/', DocumentDetailView.as_view(), name='detail'),
    path('<int:pk>/approve/', DocumentApprovalView.as_view(), name='approve'),
    path('<int:pk>/new-version/', DocumentNewVersionView.as_view(), name='new-version'),
    
    path('versions/<int:pk>/status/', DocumentProcessingStatusView.as_view(), name='version-status'),
]

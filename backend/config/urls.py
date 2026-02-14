"""
Main URL Configuration for Knowledge Platform.

Routes:
- /api/auth/ - Authentication endpoints (login, register, refresh)
- /api/documents/ - Document management
- /api/retrieval/ - Query and RAG endpoints
- /api/analytics/ - Analytics and reporting
- /api/audit/ - Audit logs
- /admin/ - Django admin panel
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Admin panel
    path('admin/', admin.site.admin_view),
    
    # API endpoints
    path('api/auth/', include('apps.core.urls')),
    path('api/documents/', include('apps.documents.urls')),
    path('api/retrieval/', include('apps.retrieval.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/audit/', include('apps.audit.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

from rest_framework import generics, serializers
from rest_framework.permissions import IsAuthenticated
from .models import AuditLog
from apps.core.permissions import IsAdmin


class AuditLogSerializer(serializers.ModelSerializer):
    
    user_username = serializers.CharField(source='user.username', read_only=True, allow_null=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'user_username', 'action', 'resource_type',
            'resource_id', 'details', 'timestamp', 'ip_address', 'user_agent'
        ]


class AuditLogListView(generics.ListAPIView):
    
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        queryset = AuditLog.objects.select_related('user')
        
        # Filter by action
        action = self.request.query_params.get('action')
        if action:
            queryset = queryset.filter(action=action)
        
        # Filter by user
        user = self.request.query_params.get('user')
        if user:
            queryset = queryset.filter(user__username=user)
        
        # Filter by resource type
        resource_type = self.request.query_params.get('resource_type')
        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)
        
        return queryset.order_by('-timestamp')

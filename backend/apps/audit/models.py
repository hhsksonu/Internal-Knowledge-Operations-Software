from django.db import models
from django.conf import settings
import json


class AuditLog(models.Model):
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs',
        help_text="User who performed the action"
    )
    
    action = models.CharField(
        max_length=100,
        help_text="Action type (e.g., DOCUMENT_UPLOAD, QUERY_EXECUTED)"
    )
    
    resource_type = models.CharField(
        max_length=100,
        help_text="Type of resource (e.g., Document, Query)"
    )
    
    resource_id = models.IntegerField(
        null=True,
        blank=True,
        help_text="ID of the affected resource"
    )
    
    details = models.JSONField(
        default=dict,
        help_text="Additional details about the action"
    )
    
    timestamp = models.DateTimeField(
        auto_now_add=True,
        help_text="When the action occurred"
    )
    
    ip_address = models.GenericIPAddressField(
        null=True, 
        blank=True,  
        default='0.0.0.0', 
        help_text="IP address of the request"
    )

    user_agent = models.TextField(
        null=True, 
        blank=True, 
        default='unknown', 
        help_text="Browser/client user agent"
    )
    
    class Meta:
        db_table = 'audit_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['action', '-timestamp']),
            models.Index(fields=['resource_type', 'resource_id']),
            models.Index(fields=['-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.user.username if self.user else 'System'} - {self.action} - {self.timestamp}"


class AuditService:
    
    @staticmethod
    def log_action(
        user,
        action: str,
        resource_type: str = None,
        resource_id: int = None,
        details: dict = None,
        ip_address: str = None,
        user_agent: str = None
    ):
        
        AuditLog.objects.create(
            user=user,
            action=action,
            resource_type=resource_type or '',
            resource_id=resource_id,
            details=details or {},
            ip_address=ip_address,
            user_agent=user_agent
        )

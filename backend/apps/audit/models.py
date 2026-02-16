"""
Audit Log Models.

Tracks all important actions in the system for security and compliance.
"""

from django.db import models
from django.conf import settings
import json


class AuditLog(models.Model):
    """
    Audit Log for tracking system actions.
    
    Why audit logging?
    - Security: Track who did what
    - Compliance: Required for many industries
    - Debugging: Understand what happened
    - Analytics: User behavior patterns
    
    What to log:
    - Document uploads/approvals/deletions
    - Queries executed
    - Feedback submitted
    - Permission changes
    - Configuration changes
    """
    
    # Who did it
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs',
        help_text="User who performed the action"
    )
    
    # What they did
    action = models.CharField(
        max_length=100,
        help_text="Action type (e.g., DOCUMENT_UPLOAD, QUERY_EXECUTED)"
    )
    
    # What resource was affected
    resource_type = models.CharField(
        max_length=100,
        help_text="Type of resource (e.g., Document, Query)"
    )
    
    resource_id = models.IntegerField(
        null=True,
        blank=True,
        help_text="ID of the affected resource"
    )
    
    # Additional context
    details = models.JSONField(
        default=dict,
        help_text="Additional details about the action"
    )
    
    # When it happened
    timestamp = models.DateTimeField(
        auto_now_add=True,
        help_text="When the action occurred"
    )
    
    # Where it came from
    ip_address = models.GenericIPAddressField(
        null=True,  # ← Already there
        blank=True,  # ← Already there
        default='0.0.0.0',  # ← ADD THIS
        help_text="IP address of the request"
    )

    user_agent = models.TextField(
        null=True,  # ← ADD THIS
        blank=True,  # ← Already there
        default='unknown',  # ← ADD THIS
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


# Audit service for easy logging
class AuditService:
    """
    Service for creating audit logs.
    
    Usage:
        AuditService.log_action(
            user=request.user,
            action='DOCUMENT_UPLOAD',
            resource_type='Document',
            resource_id=document.id,
            details={'title': document.title}
        )
    """
    
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
        """
        Create an audit log entry.
        """
        
        AuditLog.objects.create(
            user=user,
            action=action,
            resource_type=resource_type or '',
            resource_id=resource_id,
            details=details or {},
            ip_address=ip_address,
            user_agent=user_agent
        )

"""
Audit Service for creating audit logs.
"""

from .models import AuditLog


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
        
        return AuditLog.objects.create(
            user=user,
            action=action,
            resource_type=resource_type or '',
            resource_id=resource_id,
            details=details or {},
            ip_address=ip_address,
            user_agent=user_agent
        )

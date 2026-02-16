"""
Production-Safe Audit Service.

CRITICAL: Audit logging must NEVER break business logic.
"""

import logging
from .models import AuditLog

logger = logging.getLogger(__name__)


class AuditService:
    """
    Defensive audit logging service.
    
    Design principles:
    1. Never crash on missing metadata
    2. Always use safe defaults
    3. Log failures, don't raise them
    4. Extract request metadata when available
    """
    
    @staticmethod
    def log_action(
        user,
        action: str,
        resource_type: str = None,
        resource_id: int = None,
        details: dict = None,
        request=None  # ← Accept request object to extract metadata
    ):
        """
        Create audit log entry with defensive defaults.
        
        Args:
            user: User performing the action (can be None for system actions)
            action: Action type (e.g., 'DOCUMENT_UPLOAD')
            resource_type: Type of resource affected
            resource_id: ID of affected resource
            details: Additional metadata (dict)
            request: Django request object (optional)
        
        Returns:
            AuditLog instance or None if creation fails
        
        This method NEVER raises exceptions - it swallows errors
        and logs them instead.
        """
        try:
            # Extract metadata from request if provided
            ip_address, user_agent = AuditService._extract_request_metadata(request)
            
            # Create audit log with safe defaults
            audit_log = AuditLog.objects.create(
                user=user,
                action=action,
                resource_type=resource_type or '',
                resource_id=resource_id,
                details=details or {},
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            return audit_log
            
        except Exception as e:
            # CRITICAL: Never crash business logic due to audit failure
            logger.error(
                f"Audit log creation failed for action '{action}': {str(e)}",
                exc_info=True,
                extra={
                    'user_id': user.id if user else None,
                    'action': action,
                    'resource_type': resource_type,
                    'resource_id': resource_id
                }
            )
            # Return None instead of raising
            return None
    
    @staticmethod
    def _extract_request_metadata(request):
        """
        Safely extract IP and User-Agent from request.
        
        Args:
            request: Django request object or None
        
        Returns:
            tuple: (ip_address, user_agent) with safe defaults
        """
        # Safe defaults
        ip_address = '0.0.0.0'
        user_agent = 'unknown'
        
        if request is None:
            return ip_address, user_agent
        
        try:
            # Extract IP address
            # Priority: X-Forwarded-For (proxy) > REMOTE_ADDR (direct)
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                # X-Forwarded-For can be a comma-separated list
                # First IP is the original client
                ip_address = x_forwarded_for.split(',')[0].strip()
            else:
                ip_address = request.META.get('REMOTE_ADDR', '0.0.0.0')
            
            # Extract User-Agent
            user_agent = request.META.get('HTTP_USER_AGENT', 'unknown')
            
            # Sanitize to prevent extremely long values
            if len(user_agent) > 500:
                user_agent = user_agent[:500] + '...'
            
        except Exception as e:
            logger.warning(
                f"Failed to extract request metadata: {str(e)}",
                exc_info=True
            )
            # Return defaults on any error
        
        return ip_address, user_agent
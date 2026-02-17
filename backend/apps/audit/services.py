import logging
from .models import AuditLog

logger = logging.getLogger(__name__)


class AuditService:
    
    @staticmethod
    def log_action(
        user,
        action: str,
        resource_type: str = None,
        resource_id: int = None,
        details: dict = None,
        request=None  
    ):
        try:
            #extract metadata 
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
            return None
    
    @staticmethod
    def _extract_request_metadata(request):
        ip_address = '0.0.0.0'
        user_agent = 'unknown'
        
        if request is None:
            return ip_address, user_agent
        
        try:
            # Extract IP address
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                #first IP is the original client
                ip_address = x_forwarded_for.split(',')[0].strip()
            else:
                ip_address = request.META.get('REMOTE_ADDR', '0.0.0.0')
            
            # Extract User
            user_agent = request.META.get('HTTP_USER_AGENT', 'unknown')
            
            if len(user_agent) > 500:
                user_agent = user_agent[:500] + '...'
            
        except Exception as e:
            logger.warning(
                f"Failed to extract request metadata: {str(e)}",
                exc_info=True
            )
        
        return ip_address, user_agent
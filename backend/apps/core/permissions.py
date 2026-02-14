"""
Custom Permission Classes for Role-Based Access Control.

These permissions are used in views to restrict access based on user roles.
"""

from rest_framework import permissions
from .models import UserRole


class IsAdmin(permissions.BasePermission):
    """
    Permission check: User must be an admin.
    
    Used for: User management, system configuration
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == UserRole.ADMIN
        )


class IsContentOwner(permissions.BasePermission):
    """
    Permission check: User must be admin or content owner.
    
    Used for: Document approval, document deletion
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in [UserRole.ADMIN, UserRole.CONTENT_OWNER]
        )


class IsReviewer(permissions.BasePermission):
    """
    Permission check: User must be admin or reviewer.
    
    Used for: Reviewing feedback, managing quality
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in [UserRole.ADMIN, UserRole.REVIEWER]
        )


class CanQuery(permissions.BasePermission):
    """
    Permission check: User has remaining query quota.
    
    Used for: RAG queries
    """
    
    message = "Daily query limit exceeded. Please try again tomorrow."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admins bypass quota
        if request.user.role == UserRole.ADMIN:
            return True
        
        return request.user.can_query()


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission: Allow owners to edit, others to read.
    
    Used for: Document access control
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for owner or admins
        if hasattr(obj, 'owner'):
            return obj.owner == request.user or request.user.is_admin()
        
        return False

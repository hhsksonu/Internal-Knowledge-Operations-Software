from rest_framework import permissions
from .models import UserRole


class IsAdmin(permissions.BasePermission):
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == UserRole.ADMIN
        )


class IsContentOwner(permissions.BasePermission):
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in [UserRole.ADMIN, UserRole.CONTENT_OWNER]
        )


class IsReviewer(permissions.BasePermission):
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in [UserRole.ADMIN, UserRole.REVIEWER]
        )


class CanQuery(permissions.BasePermission):
    
    message = "Daily query limit exceeded. Please try again tomorrow."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admins bypass
        if request.user.role == UserRole.ADMIN:
            return True
        
        return request.user.can_query()


class IsOwnerOrReadOnly(permissions.BasePermission):
    
    def has_object_permission(self, request, view, obj):
        # read permissions for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        #write permissions only for owner or admins
        if hasattr(obj, 'owner'):
            return obj.owner == request.user or request.user.is_admin()
        
        return False

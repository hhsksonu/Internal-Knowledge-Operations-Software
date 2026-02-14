"""
Core Models for Knowledge Platform.

This module defines:
1. User - Extended user model with roles and quota tracking
2. UserRole - Enum for different user roles
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator


class UserRole(models.TextChoices):
    """
    User Roles define what actions users can perform.
    
    - ADMIN: Full system access, user management, all documents
    - CONTENT_OWNER: Can upload, approve, and manage documents
    - EMPLOYEE: Can query and provide feedback
    - REVIEWER: Can review feedback and flag issues
    
    This is a simple role system. In a real enterprise system,
    you might use a more complex permission system with groups.
    """
    ADMIN = 'ADMIN', 'Administrator'
    CONTENT_OWNER = 'CONTENT_OWNER', 'Content Owner'
    EMPLOYEE = 'EMPLOYEE', 'Employee'
    REVIEWER = 'REVIEWER', 'Reviewer'


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    
    Added fields:
    - role: User's role in the system
    - daily_query_count: Tracks queries made today (resets daily)
    - total_tokens_used: Cumulative token usage for cost tracking
    - last_query_reset: When we last reset the daily counter
    - is_active: Whether user can access the system
    
    Why track queries and tokens?
    - Cost control: LLM APIs charge per token
    - Fair usage: Prevent abuse
    - Analytics: Understand usage patterns
    """
    
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.EMPLOYEE,
        help_text="User's role determines their permissions"
    )
    
    # Query tracking for rate limiting
    daily_query_count = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Number of queries made today"
    )
    
    # Token usage tracking for cost control
    total_tokens_used = models.BigIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Total tokens consumed (input + output)"
    )
    
    # When to reset the daily counter
    last_query_reset = models.DateTimeField(
        auto_now_add=True,
        help_text="Last time daily_query_count was reset"
    )
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
        ]
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    def is_admin(self):
        """Check if user has admin role"""
        return self.role == UserRole.ADMIN
    
    def is_content_owner(self):
        """Check if user can manage documents"""
        return self.role in [UserRole.ADMIN, UserRole.CONTENT_OWNER]
    
    def can_query(self):
        """Check if user has query quota remaining"""
        from django.conf import settings
        max_queries = settings.RATE_LIMIT_CONFIG['MAX_QUERIES_PER_DAY']
        return self.daily_query_count < max_queries
    
    def increment_query_count(self):
        """Increment daily query counter"""
        self.daily_query_count += 1
        self.save(update_fields=['daily_query_count'])
    
    def add_token_usage(self, tokens):
        """Add to total token usage"""
        self.total_tokens_used += tokens
        self.save(update_fields=['total_tokens_used'])

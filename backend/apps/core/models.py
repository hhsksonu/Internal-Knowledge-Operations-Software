from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator


class UserRole(models.TextChoices):
    ADMIN = 'ADMIN', 'Administrator'
    CONTENT_OWNER = 'CONTENT_OWNER', 'Content Owner'
    EMPLOYEE = 'EMPLOYEE', 'Employee'
    REVIEWER = 'REVIEWER', 'Reviewer'


class User(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.EMPLOYEE,
        help_text="User's role determines their permissions"
    )
    
    #query tracking for rate
    daily_query_count = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Number of queries made today"
    )
    
    #token tracking 
    total_tokens_used = models.BigIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Total tokens consumed (input + output)"
    )
    
    #reset the daily counter
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
        return self.role == UserRole.ADMIN
    
    def is_content_owner(self):
        return self.role in [UserRole.ADMIN, UserRole.CONTENT_OWNER]
    
    def can_query(self):
        from django.conf import settings
        max_queries = settings.RATE_LIMIT_CONFIG['MAX_QUERIES_PER_DAY']
        return self.daily_query_count < max_queries
    
    def increment_query_count(self):
        self.daily_query_count += 1
        self.save(update_fields=['daily_query_count'])
    
    def add_token_usage(self, tokens):
        self.total_tokens_used += tokens
        self.save(update_fields=['total_tokens_used'])

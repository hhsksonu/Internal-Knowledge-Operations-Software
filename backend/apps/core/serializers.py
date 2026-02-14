"""
Serializers for User Authentication and Management.

Serializers convert complex data types (like Django models) to/from JSON.
They also handle validation.
"""

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, UserRole


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.
    
    Used for displaying user information (GET requests).
    Excludes sensitive fields like password.
    """
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'daily_query_count', 'total_tokens_used',
            'is_active', 'date_joined'
        ]
        read_only_fields = ['id', 'daily_query_count', 'total_tokens_used', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    
    Handles new user creation with password validation.
    """
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'role'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        """
        Validate that passwords match.
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password': "Passwords do not match."
            })
        return attrs
    
    def validate_role(self, value):
        """
        Only admins can create admin users.
        For new registrations, default to EMPLOYEE.
        """
        request = self.context.get('request')
        if value == UserRole.ADMIN:
            if not request or not request.user.is_authenticated or not request.user.is_admin():
                raise serializers.ValidationError(
                    "Only administrators can create admin users."
                )
        return value
    
    def create(self, validated_data):
        """
        Create a new user with hashed password.
        """
        # Remove password_confirm as it's not a model field
        validated_data.pop('password_confirm')
        
        # Create user with hashed password
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', UserRole.EMPLOYEE)
        )
        
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user information.
    
    Allows users to update their own profile.
    Admins can update roles and active status.
    """
    
    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'role', 'is_active'
        ]
    
    def validate_role(self, value):
        """
        Only admins can change roles.
        """
        request = self.context.get('request')
        if not request or not request.user.is_admin():
            # Non-admins can't change roles
            if value != self.instance.role:
                raise serializers.ValidationError(
                    "You don't have permission to change user roles."
                )
        return value


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for changing password.
    """
    
    old_password = serializers.CharField(
        required=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """
        Validate that new passwords match.
        """
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password': "New passwords do not match."
            })
        return attrs
    
    def validate_old_password(self, value):
        """
        Validate that old password is correct.
        """
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

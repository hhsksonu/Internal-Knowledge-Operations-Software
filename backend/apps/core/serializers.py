from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, UserRole


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'daily_query_count', 'total_tokens_used',
            'is_active', 'date_joined'
        ]
        read_only_fields = ['id', 'daily_query_count', 'total_tokens_used', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
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
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password': "Passwords do not match."
            })
        return attrs
    
    def validate_role(self, value):
        request = self.context.get('request')
        if value == UserRole.ADMIN:
            if not request or not request.user.is_authenticated or not request.user.is_admin():
                raise serializers.ValidationError(
                    "Only administrators can create admin users."
                )
        return value
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        
        # hashed password
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
    
    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'role', 'is_active'
        ]
    
    def validate_role(self, value):
        request = self.context.get('request')
        if not request or not request.user.is_admin():
            if value != self.instance.role:
                raise serializers.ValidationError(
                    "You don't have permission to change user roles."
                )
        return value


class PasswordChangeSerializer(serializers.Serializer):
    
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
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password': "New passwords do not match."
            })
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

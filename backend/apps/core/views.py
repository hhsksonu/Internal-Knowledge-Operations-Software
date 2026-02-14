"""
Authentication Views for User Management.

Endpoints:
- POST /api/auth/register/ - Create new user
- POST /api/auth/login/ - Get JWT tokens
- POST /api/auth/refresh/ - Refresh access token
- GET /api/auth/profile/ - Get current user profile
- PUT /api/auth/profile/ - Update profile
- POST /api/auth/change-password/ - Change password
"""

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import update_session_auth_hash

from .models import User
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserUpdateSerializer,
    PasswordChangeSerializer
)
from .permissions import IsAdmin


class RegisterView(generics.CreateAPIView):
    """
    User Registration Endpoint.
    
    POST /api/auth/register/
    
    Request body:
    {
        "username": "john_doe",
        "email": "john@example.com",
        "password": "SecurePass123!",
        "password_confirm": "SecurePass123!",
        "first_name": "John",
        "last_name": "Doe",
        "role": "EMPLOYEE"  # Optional, defaults to EMPLOYEE
    }
    
    Response: User object with JWT tokens
    """
    
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]  # Allow anyone to register
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens for the new user
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    User Profile Endpoint.
    
    GET /api/auth/profile/ - Get current user's profile
    PUT /api/auth/profile/ - Update current user's profile
    
    Requires authentication.
    """
    
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        # Return the current logged-in user
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserSerializer
        return UserUpdateSerializer


class ChangePasswordView(APIView):
    """
    Change Password Endpoint.
    
    POST /api/auth/change-password/
    
    Request body:
    {
        "old_password": "OldPass123!",
        "new_password": "NewPass123!",
        "new_password_confirm": "NewPass123!"
    }
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            # Set new password
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            
            # Update session to prevent logout
            update_session_auth_hash(request, request.user)
            
            return Response({
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class UserListView(generics.ListAPIView):
    """
    List All Users (Admin Only).
    
    GET /api/auth/users/
    
    Query params:
    - role: Filter by role
    - search: Search by username or email
    """
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by role if provided
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        
        # Search by username or email
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(username__icontains=search) |
                models.Q(email__icontains=search)
            )
        
        return queryset.order_by('-date_joined')


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    User Detail Endpoint (Admin Only).
    
    GET /api/auth/users/<id>/ - Get user details
    PUT /api/auth/users/<id>/ - Update user
    DELETE /api/auth/users/<id>/ - Deactivate user
    """
    
    queryset = User.objects.all()
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAdmin]
    
    def delete(self, request, *args, **kwargs):
        """
        Soft delete: Deactivate user instead of deleting.
        """
        user = self.get_object()
        user.is_active = False
        user.save()
        
        return Response({
            'message': f'User {user.username} has been deactivated'
        }, status=status.HTTP_200_OK)

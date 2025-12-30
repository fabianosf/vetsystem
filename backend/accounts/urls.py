"""
URLs de autenticação
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from accounts.views import (
    CustomTokenObtainPairView,
    UserRegistrationView,
    get_current_user,
    update_current_user
)

urlpatterns = [
    # JWT Authentication
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', TokenBlacklistView.as_view(), name='logout'),
    
    # User Management
    path('register/', UserRegistrationView, name='register'),
    path('me/', get_current_user, name='current_user'),
    path('me/update/', update_current_user, name='update_user'),
]

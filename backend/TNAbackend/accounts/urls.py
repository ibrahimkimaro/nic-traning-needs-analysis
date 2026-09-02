from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView, UserMeView, UserProfileUpdateView, LogoutView,
    RoleListView, UserListView, UserDetailView,
    DepartmentListView, DepartmentDetailView,
    PositionListView, PositionDetailView
)

urlpatterns = [
    # Authentication & Profile
    path('login/', LoginView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('me/', UserMeView.as_view(), name='user_me'),
    path('profile/', UserProfileUpdateView.as_view(), name='user_profile_update'),

    # Roles
    path('roles/', RoleListView.as_view(), name='role-list'),

    # Users / Staff Management
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<uuid:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('staff/', UserListView.as_view(), name='staff-list'),
    path('staff/<uuid:pk>/', UserDetailView.as_view(), name='staff-detail'),
    path('employees/', UserListView.as_view(), name='employee-list'),
    path('employees/<uuid:pk>/', UserDetailView.as_view(), name='employee-detail'),

    # Departments
    path('departments/', DepartmentListView.as_view(), name='department-list'),
    path('departments/<int:pk>/', DepartmentDetailView.as_view(), name='department-detail'),

    # Positions
    path('positions/', PositionListView.as_view(), name='position-list'),
    path('positions/<int:pk>/', PositionDetailView.as_view(), name='position-detail'),
]

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Q
from .models import User, Role, Department, Position
from .serializers import (
    UserSerializer, UserCreateUpdateSerializer, UserProfileUpdateSerializer,
    RoleSerializer, DepartmentSerializer, PositionSerializer
)

class IsHRorAdmin(permissions.BasePermission):
    """
    Permission allowing access only to HR Managers, Admins, or Superusers.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser or request.user.is_staff:
            return True
        return request.user.roles.filter(role_name__in=['HR_MANAGER', 'ADMIN']).exists()

class LoginView(TokenObtainPairView):
    """
    Custom Login View returning additional user profile details with JWT tokens.
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            username = response.data.get('username')
            user = User.objects.filter(Q(username=username) | Q(email=username)).first()
            if user:
                serializer = UserSerializer(user)
                response.data['user'] = serializer.data
        return response

class UserMeView(generics.RetrieveAPIView):
    """
    Retrieve current authenticated user's profile.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserProfileUpdateView(generics.UpdateAPIView):
    """
    Update user profile (language preference, password).
    """
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)

class RoleListView(generics.ListAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserListView(generics.ListCreateAPIView):
    """
    List staff users or create a new user profile.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateUpdateSerializer
        return UserSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = User.objects.all().select_related('dept', 'position', 'supervisor').prefetch_related('roles')

        # Admin and HR can see all users
        if user.is_superuser or user.is_staff or user.roles.filter(role_name__in=['ADMIN', 'HR_MANAGER']).exists():
            pass
        elif user.roles.filter(role_name='DEPT_HEAD').exists():
            # Supervisors see their subordinates and themselves
            queryset = queryset.filter(Q(supervisor=user) | Q(id=user.id))
        else:
            # Regular employees see themselves
            queryset = queryset.filter(id=user.id)

        # Query filters
        dept_id = self.request.query_params.get('dept')
        if dept_id:
            queryset = queryset.filter(dept_id=dept_id)

        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(roles__role_name=role)

        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        return queryset.distinct()

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a staff user.
    """
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserCreateUpdateSerializer
        return UserSerializer

class UserDeleteView(generics.DestroyAPIView):
    """
    Delete a staff user.
    """
    queryset = User.objects.all()
    permission_classes = [permissions.IsAdminUser]

class DepartmentListView(generics.ListCreateAPIView):
    queryset = Department.objects.all().select_related('head', 'parent_dept')
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [IsHRorAdmin()]

class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Department.objects.all().select_related('head', 'parent_dept')
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [IsHRorAdmin()]

class PositionListView(generics.ListCreateAPIView):
    serializer_class = PositionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Position.objects.all().select_related('dept')
        dept_id = self.request.query_params.get('dept')
        if dept_id:
            queryset = queryset.filter(dept_id=dept_id)
        return queryset

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [IsHRorAdmin()]

class PositionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Position.objects.all().select_related('dept')
    serializer_class = PositionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [IsHRorAdmin()]

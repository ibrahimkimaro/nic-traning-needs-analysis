from rest_framework import permissions


class RoleAdminReadOnly(permissions.BasePermission):
    """Allow application ADMIN users to view, but not mutate domain data."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        is_application_admin = user.roles.filter(role_name='ADMIN').exists()
        return not is_application_admin or user.is_superuser

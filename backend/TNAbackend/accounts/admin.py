from django.contrib import admin
from .models import User, Role, Department, Position

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'employee_number', 'dept', 'position', 'status', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'employee_number')
    list_filter = ('dept', 'position', 'status', 'is_staff')
    filter_horizontal = ('roles', 'groups', 'user_permissions')

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('role_name', 'description')

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('dept_name', 'dept_code', 'head', 'parent_dept')
    search_fields = ('dept_name', 'dept_code')

@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ('title', 'dept', 'grade_level')
    list_filter = ('dept',)

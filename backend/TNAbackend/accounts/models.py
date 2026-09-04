from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
from core.models import TimeStampedModel

class Role(TimeStampedModel):
    ROLE_CHOICES = [
        ('ADMIN', 'System Administrator'),
        ('HR_MANAGER', 'HR / Training Manager'),
        ('DEPT_HEAD', 'Department Head / Supervisor'),
        ('FINANCE', 'Finance / Budget Approver'),
        ('EMPLOYEE', 'Employee'),
        ('TRAINER', 'Trainer'),
        ('DIRECTOR','Manager Director'),
    ]
    role_name = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.get_role_name_display()

class Department(TimeStampedModel):
    dept_name = models.CharField(max_length=100, unique=True)
    dept_code = models.CharField(max_length=20, unique=True)
    head = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='headed_departments')
    parent_dept = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='sub_departments')

    def __str__(self):
        return self.dept_name

class Position(TimeStampedModel):
    title = models.CharField(max_length=100)
    dept = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='positions')
    grade_level = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.title} ({self.dept.dept_name})"

class User(AbstractUser, TimeStampedModel):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('ON_LEAVE', 'On Leave'),
        ('RETIRED', 'Retired'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    employee_number = models.CharField(max_length=50, unique=True, null=True, blank=True)
    dept = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    position = models.ForeignKey(Position, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    supervisor = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subordinates')
    status = models.CharField(max_length=20, default='ACTIVE', choices=STATUS_CHOICES)
    language_pref = models.CharField(max_length=10, default='en', choices=[('en', 'English'), ('sw', 'Swahili')])
    roles = models.ManyToManyField(Role, related_name='users', blank=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def get_full_name(self):
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.username

    def __str__(self):
        emp_num = f" ({self.employee_number})" if self.employee_number else ""
        return f"{self.get_full_name()}{emp_num}"

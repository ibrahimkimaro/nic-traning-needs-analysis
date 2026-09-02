"""
URL configuration for TNAbackend project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/organizations/', include('accounts.urls')), # Alias pointing to accounts
    path('api/v1/competencies/', include('competencies.urls')),
    path('api/v1/assessments/', include('assessments.urls')),
    path('api/v1/tna/', include('tna.urls')),
    path('api/v1/training/', include('training.urls')),
    path('api/v1/budget/', include('budget.urls')),
    path('api/v1/compliance/', include('compliance.urls')),
]

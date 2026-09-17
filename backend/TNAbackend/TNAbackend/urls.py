"""
URL configuration for TNAbackend project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve

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
    path('api/v1/notifications/', include('notifications.urls')),

    # Media & file uploads routes
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^training_attachments/(?P<path>.*)$', serve, {'document_root': settings.BASE_DIR / 'training_attachments'}),
]

"""URL configuration for WayPoint Logistics server.

This module defines the main URL patterns for the Django application,
including API endpoints for authentication and delivery management.

API Versioning:
- All API endpoints are versioned to support backward compatibility
- Current version: v1
- Format: /v1/auth/, /v1/delivery/
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_info(_request):
    """Return API information and available endpoints.
    
    Returns:
        JsonResponse: API information including version and available endpoints.
    """
    return JsonResponse({
        'message': 'WayPoint Logistics API',
        'version': '1.0',
        'current_api_version': 'v1',
        'endpoints': {
            'admin': '/admin/',
            'v1': {
                'authentication': '/v1/auth/',
                'delivery': '/v1/delivery/'
            }
        }
    })

# API v1 URL patterns
v1_patterns = [
    path('auth/', include('authentication.urls')),
    path('delivery/', include('delivery.urls')),
]

urlpatterns = [
    path('', api_info, name='api_info'),
    path('admin/', admin.site.urls),
    path('v1/', include(v1_patterns)),
]

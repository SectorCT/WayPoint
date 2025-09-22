from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_info(request):
    return JsonResponse({
        'message': 'WayPoint Logistics API',
        'version': '1.0',
        'endpoints': {
            'admin': '/admin/',
            'authentication': '/auth/',
            'delivery': '/delivery/'
        }
    })

urlpatterns = [
    path('', api_info, name='api_info'),
    path('admin/', admin.site.urls),
    path('auth/', include('authentication.urls')),  
    path('delivery/', include('delivery.urls')),
]

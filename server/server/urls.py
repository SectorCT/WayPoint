from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('authentication.urls')),  
    path('delivery/', include('delivery.urls')),
    path('api/company/', include('company_management.urls')),
]

from django.urls import path
from .views import createPackage

urlpatterns = [
    path('createPackage/', createPackage.as_view(), name='create-package'),
]
from django.urls import path
from .views import createPackage, deletePackage, bulkCreatePackages, getAllPackages

urlpatterns = [
    path('packages/', getAllPackages.as_view(), name='get-all-packages'),
    path('packages/create/', createPackage.as_view(), name='create-package'),
    path('packages/<int:id>/', deletePackage.as_view(), name='delete-package'),
    path('packages/bulk-create/', bulkCreatePackages.as_view(), name='bulk-create-packages'),
]

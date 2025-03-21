from django.urls import path
from .package import createPackage, deletePackage, createManyPackages, getAllPackages, MarkAsDelivered
from .truck import createTruck, getAllTrucks, deleteTruck
from .routing import RoutePlannerView, getRoutingBasedOnDriver

urlpatterns = [
    path('packages/', getAllPackages.as_view(), name='get-all-packages'),
    path('packages/create/', createPackage.as_view(), name='create-package'),

    path('packages/createMany/', createManyPackages.as_view(), name='create-package'),
    path('packages/<str:id>/', deletePackage.as_view(), name='delete-package'),
    path('packages/mark/', MarkAsDelivered.as_view(), name='mark-as-delivered'),

    
    path('trucks/', getAllTrucks.as_view(), name='get-all-trucks'),
    path('trucks/create/', createTruck.as_view(), name='create-truck'),
    path('trucks/<str:licensePlate>/', deleteTruck.as_view(), name='delete-truck'),

    path('route/getByDriver/', getRoutingBasedOnDriver.as_view(), name='get-routing-based-on-driver'),
    path('route/', RoutePlannerView.as_view(), name = 'route')
]
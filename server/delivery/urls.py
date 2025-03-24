from django.urls import path

# Package Views
from .views.package import (
    CreatePackageView,
    CreateManyPackagesView,
    GetAllPackagesView,
    DeletePackageView,
    MarkAsDeliveredView
)

# Truck Views
from .views.truck import (
    CreateTruckView,
    GetAllTrucksView,
    DeleteTruckView
)

# Route Views
from .routing.routing import (
    RoutePlannerView,
    GetRoutingBasedOnDriverView,
    GetAllRoutingsView,
    FinishRouteView,
    DropAllRoutesView,
    FetchAddressView
)


urlpatterns = [
    path('packages/', GetAllPackagesView.as_view(), name='get_all_packages'),
    path('packages/create/', CreatePackageView.as_view(), name='create_package'),
    path('packages/bulk-create/', CreateManyPackagesView.as_view(), name='create_many_packages'),
    path('packages/delete/<str:id>/', DeletePackageView.as_view(), name='delete_package'),
    path('packages/mark-delivered/', MarkAsDeliveredView.as_view(), name='mark_as_delivered'),

    path('trucks/', GetAllTrucksView.as_view(), name='get_all_trucks'),
    path('trucks/create/', CreateTruckView.as_view(), name='create_truck'),
    path('trucks/delete/<str:licensePlate>/', DeleteTruckView.as_view(), name='delete_truck'),

    path('routes/plan/', RoutePlannerView.as_view(), name='routePlan'),
    path('routes/driver/', GetRoutingBasedOnDriverView.as_view(), name='getRoutingBasedOnDriver'),
    path('routes/all/', GetAllRoutingsView.as_view(), name='getAllRoutes'),
    path('routes/finish/', FinishRouteView.as_view(), name='finishRoute'),
    path('routes/drop-all/', DropAllRoutesView.as_view(), name='dropAllRoutes'),

    path('address/', FetchAddressView.as_view(), name='fetch_address'),
]
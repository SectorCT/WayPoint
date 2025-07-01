from django.urls import path
from .package import createPackage, deletePackage, createManyPackages, getAllPackages, mark_delivered, mark_undelivered
from .truck import createTruck, getAllTrucks, deleteTruck, getAvailableTrucks
from .routing import dropAllRoutes, finishRoute, RoutePlannerView, getRoutingBasedOnDriver, getAllRoutings, getReturnRoute, CheckDriverStatusView, AssignTruckAndStartJourneyView, recalculateRoute
from .delivery_history import CreateDeliveryHistoryView, GetDeliveryHistoryView, GetDetailedDeliveryHistoryView, CreateTodayDeliveryHistoryView

urlpatterns = [
    path('packages/', getAllPackages.as_view(), name='get-all-packages'),
    path('packages/create/', createPackage.as_view(), name='create-package'),

    path('packages/createMany/', createManyPackages.as_view(), name='create-package'),
    path('packages/<str:id>/', deletePackage.as_view(), name='delete-package'),
    path('packages_mark/', mark_delivered, name='mark-as-delivered'),
    path('packages_mark_undelivered/', mark_undelivered, name='mark-as-undelivered'),

    
    path('trucks/', getAllTrucks.as_view(), name='get-all-trucks'),
    path('trucks/create/', createTruck.as_view(), name='create-truck'),
    path('trucks/available/', getAvailableTrucks.as_view(), name='get-available-trucks'),
    path('trucks/<str:licensePlate>/', deleteTruck.as_view(), name='delete-truck'),



    path('route/getByDriver/', getRoutingBasedOnDriver.as_view(), name='get-routing-based-on-driver'),
    path('route/', RoutePlannerView.as_view(), name = 'route'),
    path('route/assign/', AssignTruckAndStartJourneyView.as_view(), name='assign-truck-and-start-journey'),
    path('route/all/', getAllRoutings.as_view(), name = 'all-routes'),
    path('route/finish/', finishRoute.as_view(), name = 'finish-route'),
    path('route/dropAll/', dropAllRoutes.as_view(), name = 'drop-all-routes'),
    path('route/return/', getReturnRoute.as_view(), name = 'get-return-route'),
    path('route/recalculate/', recalculateRoute.as_view(), name = 'recalculate-route'),
    path('route/checkDriverStatus/', CheckDriverStatusView.as_view(), name = 'check-driver-status'),

    # Delivery History endpoints
    path('history/create/', CreateDeliveryHistoryView.as_view(), name='create-delivery-history'),
    path('history/', GetDeliveryHistoryView.as_view(), name='get-delivery-history'),
    path('history/detailed/', GetDetailedDeliveryHistoryView.as_view(), name='get-detailed-delivery-history'),
    path('history/create-today/', CreateTodayDeliveryHistoryView.as_view(), name='create-today-delivery-history'),
]
from django.contrib import admin
from .models import Package, Truck, RouteAssignment, DeliveryHistory, Office, OfficeDelivery

# Register your models here.
admin.site.register(Package)
admin.site.register(Truck)
admin.site.register(RouteAssignment)
admin.site.register(DeliveryHistory)
admin.site.register(Office)
admin.site.register(OfficeDelivery)

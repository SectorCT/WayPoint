from django.contrib.auth import get_user_model
from datetime import timedelta
from django.db import models

User = get_user_model()


class PackageManager(models.Manager):
    
    def pending_packages(self):
        return self.filter(status='pending')

    def in_transit_packages(self):
        return self.filter(status='in_transit')

    def delivered_packages(self):
        return self.filter(status='delivered')

    def recent_deliveries(self, days=7):
        from django.utils.timezone import now
        return self.filter(status='delivered', deliveryDate__gte=now() - timedelta(days=days))
    
    def create_package(
        self,
        address,
        latitude,
        recipient,
        recipientPhoneNumber,
        deliveryDate,
        longitude,
        weight,
        status='pending'
    ):
        package = self.model(
            address=address,
            latitude=latitude,
            recipient=recipient,
            recipientPhoneNumber=recipientPhoneNumber,
            deliveryDate=deliveryDate,
            longitude=longitude,
            weight=weight,
            status=status
        )
        package.save(using=self._db)
        return package

class Package(models.Model):
    address = models.CharField(max_length=255)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True,
        help_text="Latitude coordinate for geolocation"
    )

    recipient = models.CharField(max_length = 50)

    recipientPhoneNumber = models.CharField(max_length=10, blank = False, null = False)

    deliveryDate = models.DateField(blank = False, null = False)

    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True,
        help_text="Longitude coordinate for geolocation"
    )
    
    weight = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        help_text="Package weight (e.g., in kilograms)"
    )
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
    ]
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending'
    )
    
class TruckManager(models.Manager):
    def available_trucks(self, min_capacity=0):
        return self.filter(kilogramCapacity__gte=min_capacity)
    
    def create_truck(self, licensePlate, kilogramCapacity, **extra_fields):
        truck = self.model(
            licensePlate=licensePlate,
            kilogramCapacity=kilogramCapacity,
            **extra_fields
        )
        truck.save(using=self._db)
        return truck

class Truck(models.Model):
    licensePlate = models.CharField(max_length=15, unique=True,)
    kilogramCapacity = models.FloatField()

    objects = TruckManager()

class RouteAssignment(models.Model):
    driver = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='route_assignments'
    )
    
    packageSequence = models.JSONField(
        default=list,
        help_text="Ordered list of Package IDs representing delivery sequence"
    )
    
    mapRoute = models.JSONField(
        default=list,
        help_text="A map drawing of the route"
    )
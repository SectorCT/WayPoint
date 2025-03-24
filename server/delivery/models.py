from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.utils.timezone import now
from datetime import timedelta
from django.db import models
import secrets

User = get_user_model()

def generate_package_id():
    return secrets.token_hex(6)

class PackageManager(models.Manager):
    def pending_packages(self):
        return self.filter(status='pending')

    def in_transit_packages(self):
        return self.filter(status='in_transit')

    def delivered_packages(self):
        return self.filter(status='delivered')

    def recent_deliveries(self, days=7):        
        return self.filter(status='delivered', deliveryDate__gte=now() - timedelta(days=days))
    
    def create_package(self, address, latitude, recipient, recipientPhoneNumber, deliveryDate, longitude, weight=0.00, status='pending'):
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
    packageID = models.CharField(
        max_length=12,
        unique=True,
        default=generate_package_id,
        editable=False  
    )
    address = models.CharField(max_length=255)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=False, blank=False,
        help_text="Latitude coordinate for geolocation"
    )
    
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=False, blank=False,
        help_text="Longitude coordinate for geolocation"
    )

    recipient = models.CharField(max_length=50)

    recipientPhoneNumber = models.CharField(
        max_length=15,
        # validators=[RegexValidator(regex=r'^\+?\d{9,15}$', message="Enter a valid phone number.")],
        blank=False, null=False
    )

    deliveryDate = models.DateField(blank=False, null=False)

    weight = models.DecimalField(
        max_digits=5, decimal_places=2, default=0.00,
        help_text="Package weight (e.g., in kilograms)"
    )

    STATUS_CHOICES = [
        # ('canceled', 'Canceled'),
        ('pending', 'Pending'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
    ]
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending'
    )

    objects = PackageManager()

    def __str__(self):
        return f"Package {self.id}: {self.recipient} ({self.status})"

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
    licensePlate = models.CharField(max_length=15, unique=True)
    kilogramCapacity = models.DecimalField(max_digits=7, decimal_places=2)
    isUsed = models.BooleanField(default=False)
    objects = TruckManager()

    def __str__(self):
        return f"Truck {self.licensePlate} - Capacity: {self.kilogramCapacity} kg"

class RouteManager(models.Manager):
    def create_route(self, **kwargs):
        driver = kwargs.get("driver")

        if not driver:
            raise ValueError("Driver must be provided.")

        # Check if there's already an active route for this driver
        if self.model.objects.filter(driver=driver, isActive=True).exists():
            raise serializers.ValidationError(
                f"Driver '{driver.username}' already has an active route."
            )

        # Use the standard object creation method
        route = self.model(**kwargs)
        route.save(using=self._db)
        return route

    def routes_for_driver(self, driver):
        return self.filter(driver=driver)

    def update_route(self, route_id, package_sequence=None, map_route=None):
        try:
            route = self.get(pk=route_id)
        except self.model.DoesNotExist:
            return None

        if package_sequence is not None:
            route.packageSequence = package_sequence
        if map_route is not None:
            route.mapRoute = map_route

        route.save(using=self._db)
        return route

class RouteAssignment(models.Model):
    routeID = models.CharField(
        max_length=12,
        unique=True,
        default=generate_package_id,
        editable=False  
    )
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

    truck = models.ForeignKey(
        Truck, on_delete=models.CASCADE, related_name='route_assignments'
    )
    
    isActive = models.BooleanField(default=True)

    dateOfCreation = models.DateField(auto_now_add=True)

    objects = RouteManager()

    def __str__(self):
        return f"Route assigned to {self.driver.username}"

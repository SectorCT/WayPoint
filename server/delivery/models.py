from django.contrib.auth import get_user_model
from rest_framework import serializers
from datetime import timedelta
from django.db import models
import secrets
from authentication.models import Company

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
        from django.utils.timezone import now
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

    signature = models.TextField(blank=True, null=True)

    STATUS_CHOICES = [
        # ('canceled', 'Canceled'),
        ('pending', 'Pending'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('undelivered', 'Undelivered'),
    ]
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending'
    )

    office = models.ForeignKey('Office', null=True, blank=True, on_delete=models.SET_NULL, related_name='packages', help_text='Office where the package is currently stored (if undelivered)')

    delivered_to_office = models.BooleanField(default=False, null=False, help_text='Whether the package was delivered to an office instead of the recipient')

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

class DeliveryHistoryManager(models.Manager):
    def get_daily_stats(self, date):
        """Get delivery statistics for a specific date"""
        return self.filter(delivery_date=date)
    
    def get_recent_history(self, days=7):
        """Get delivery history for the last N days"""
        from django.utils.timezone import now
        from datetime import timedelta
        end_date = now().date()
        start_date = end_date - timedelta(days=days)
        return self.filter(delivery_date__range=[start_date, end_date]).order_by('-delivery_date')


class DeliveryHistory(models.Model):
    delivery_date = models.DateField(help_text="Date when the delivery was completed")
    driver = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='delivery_history'
    )
    truck = models.ForeignKey(
        Truck, on_delete=models.CASCADE, related_name='delivery_history'
    )
    total_packages = models.IntegerField(default=0, help_text="Total number of packages delivered")
    total_kilos = models.DecimalField(
        max_digits=8, decimal_places=2, default=0.00,
        help_text="Total weight of packages delivered in kilograms"
    )
    undelivered_packages = models.IntegerField(default=0, help_text="Total number of packages that couldn't be delivered")
    undelivered_kilos = models.DecimalField(
        max_digits=8, decimal_places=2, default=0.00,
        help_text="Total weight of packages that couldn't be delivered in kilograms"
    )
    duration_hours = models.DecimalField(
        max_digits=4, decimal_places=2, default=0.00,
        help_text="Duration of the delivery journey in hours"
    )
    completed_packages = models.ManyToManyField(
        Package, related_name='delivery_history',
        help_text="Packages that were delivered in this journey"
    )
    undelivered_packages_list = models.ManyToManyField(
        Package, related_name='undelivered_history',
        help_text="Packages that couldn't be delivered in this journey"
    )
    route_assignment = models.ForeignKey(
        RouteAssignment, on_delete=models.CASCADE, related_name='delivery_history',
        null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = DeliveryHistoryManager()

    class Meta:
        unique_together = ['delivery_date', 'driver']
        ordering = ['-delivery_date']

    def __str__(self):
        return f"Delivery by {self.driver.username} on {self.delivery_date}"

    def calculate_stats(self):
        """Calculate and update delivery statistics"""
        delivered_packages = self.completed_packages.filter(status='delivered')
        undelivered_packages = self.undelivered_packages_list.filter(status='undelivered')
        
        self.total_packages = delivered_packages.count()
        self.total_kilos = delivered_packages.aggregate(
            total_weight=models.Sum('weight')
        )['total_weight'] or 0.00
        
        self.undelivered_packages = undelivered_packages.count()
        self.undelivered_kilos = undelivered_packages.aggregate(
            total_weight=models.Sum('weight')
        )['total_weight'] or 0.00
        
        self.save()

class Office(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='offices')

    def __str__(self):
        return f"{self.name} ({self.address})"


class OfficeDelivery(models.Model):
    """Track when undelivered packages are delivered to offices"""
    driver = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='office_deliveries'
    )
    office = models.ForeignKey(
        Office, on_delete=models.CASCADE, related_name='deliveries'
    )
    packages = models.ManyToManyField(
        Package, related_name='office_deliveries',
        help_text="Packages that were delivered to this office"
    )
    delivery_date = models.DateTimeField(auto_now_add=True)
    route_assignment = models.ForeignKey(
        RouteAssignment, on_delete=models.CASCADE, related_name='office_deliveries',
        null=True, blank=True
    )

    class Meta:
        unique_together = ['driver', 'office', 'delivery_date']
        ordering = ['-delivery_date']

    def __str__(self):
        return f"Office delivery by {self.driver.username} to {self.office.name} on {self.delivery_date}"

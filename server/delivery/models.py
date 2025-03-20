from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

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

class RouteAssignment(models.Model):
    driver = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='route_assignments'
    )
    
    package_sequence = models.JSONField(
        default=list,
        help_text="Ordered list of Package IDs representing delivery sequence"
    )
    
    mapRoute = models.JSONField(
        default=list,
        help_text="A map drawing of the route"
    )
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from delivery.models import DeliveryHistory, Package, Truck
from datetime import timedelta
import random
from django.db import models

User = get_user_model()

class Command(BaseCommand):
    help = 'Create delivery history for real packages only (no dummy packages)'

    def handle(self, *args, **options):
        self.stdout.write('Creating delivery history for real packages...')
        
        # Get all delivered packages from the last 7 days
        today = timezone.now().date()
        for i in range(7):
            delivery_date = today - timedelta(days=i)
            delivered_packages = Package.objects.filter(deliveryDate=delivery_date, status='delivered')
            if not delivered_packages.exists():
                self.stdout.write(f'No delivered packages for {delivery_date}')
                continue

            # Group by driver and truck if possible (assuming you have this info)
            # For now, just assign to the first available driver and truck
            driver = delivered_packages.first().recipient  # Placeholder: adjust as needed
            truck = Truck.objects.first()  # Placeholder: adjust as needed
            if not truck:
                self.stdout.write('No trucks found, skipping')
                continue

            # Create or update delivery history
            history, created = DeliveryHistory.objects.get_or_create(
                delivery_date=delivery_date,
                driver=truck.route_assignments.first().driver if truck.route_assignments.exists() else None,
                defaults={
                    'truck': truck,
                    'total_packages': delivered_packages.count(),
                    'total_kilos': delivered_packages.aggregate(total_weight=models.Sum('weight'))['total_weight'] or 0.0,
                    'duration_hours': random.uniform(2.0, 6.0),
                }
            )
            if created:
                history.completed_packages.set(delivered_packages)
                self.stdout.write(f'Created delivery history for {delivery_date}')
            else:
                self.stdout.write(f'Delivery history for {delivery_date} already exists')
        self.stdout.write(self.style.SUCCESS('Finished creating delivery history for real packages.')) 
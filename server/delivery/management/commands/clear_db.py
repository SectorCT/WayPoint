from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from delivery.models import Package, Truck, RouteAssignment, DeliveryHistory

User = get_user_model()

class Command(BaseCommand):
    help = 'Deletes all non-superuser Users, Packages, Trucks, RouteAssignments, and DeliveryHistory from the database.'

    def handle(self, *args, **options):
        self.stdout.write('Clearing database tables...')

        # Delete objects that have foreign keys first to avoid integrity errors
        route_count, _ = RouteAssignment.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {route_count} route assignments.'))

        history_count, _ = DeliveryHistory.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {history_count} delivery history records.'))

        package_count, _ = Package.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {package_count} packages.'))

        truck_count, _ = Truck.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {truck_count} trucks.'))
        
        # Keep superusers, delete others
        user_count, _ = User.objects.filter(is_superuser=False).delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {user_count} users (superusers kept).'))
        
        self.stdout.write(self.style.SUCCESS('Database clearing complete.')) 
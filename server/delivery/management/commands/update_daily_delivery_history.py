from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from delivery.models import DeliveryHistory, Package, RouteAssignment
from django.db.models import Sum, Q
from datetime import timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Update delivery history for all delivered packages at end of day'

    def add_arguments(self, parser):
        parser.add_argument(
            '--date',
            type=str,
            help='Specific date to update (YYYY-MM-DD format). Defaults to today.',
        )

    def handle(self, *args, **options):
        # Get the date to process
        if options['date']:
            try:
                from datetime import datetime
                target_date = datetime.strptime(options['date'], '%Y-%m-%d').date()
            except ValueError:
                self.stdout.write(self.style.ERROR('Invalid date format. Use YYYY-MM-DD'))
                return
        else:
            target_date = timezone.now().date()
        
        self.stdout.write(f'Updating delivery history for {target_date}')
        
        # Get all delivered packages for the target date
        delivered_packages = Package.objects.filter(
            deliveryDate=target_date,
            status='delivered'
        )
        
        if not delivered_packages.exists():
            self.stdout.write(f'No delivered packages found for {target_date}')
            return
        
        self.stdout.write(f'Found {delivered_packages.count()} delivered packages')
        
        # Group packages by driver (if we can determine this from route assignments)
        # For now, let's create a summary for the day
        total_packages = delivered_packages.count()
        total_kilos = delivered_packages.aggregate(
            total_weight=Sum('weight')
        )['total_weight'] or 0.00
        
        # Get active routes for the day to determine drivers
        active_routes = RouteAssignment.objects.filter(
            dateOfCreation=target_date,
            isActive=True
        )
        
        if active_routes.exists():
            # Create delivery history for each driver
            for route in active_routes:
                try:
                    # Get packages for this specific route
                    route_packages = delivered_packages.filter(
                        packageID__in=[pkg.get('packageID') for pkg in route.packageSequence if pkg.get('packageID') != 'ADMIN']
                    )
                    
                    if route_packages.exists():
                        route_kilos = route_packages.aggregate(
                            total_weight=Sum('weight')
                        )['total_weight'] or 0.00
                        
                        # Create or update delivery history
                        delivery_history, created = DeliveryHistory.objects.get_or_create(
                            delivery_date=target_date,
                            driver=route.driver,
                            defaults={
                                'truck': route.truck,
                                'total_packages': route_packages.count(),
                                'total_kilos': route_kilos,
                                'duration_hours': 0,  # Could be calculated if we track start/end times
                                'route_assignment': route
                            }
                        )
                        
                        if not created:
                            # Update existing record
                            delivery_history.truck = route.truck
                            delivery_history.total_packages = route_packages.count()
                            delivery_history.total_kilos = route_kilos
                            delivery_history.route_assignment = route
                            delivery_history.save()
                        
                        # Add delivered packages to the history
                        delivery_history.completed_packages.set(route_packages)
                        
                        self.stdout.write(
                            f'Updated delivery history for {route.driver.username}: '
                            f'{route_packages.count()} packages, {route_kilos} kg'
                        )
                        
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'Error updating history for route {route.routeID}: {str(e)}')
                    )
        else:
            # No active routes, create a general summary
            self.stdout.write('No active routes found, creating general summary')
            
            # Create a summary entry (you might want to assign this to a default driver)
            try:
                delivery_history, created = DeliveryHistory.objects.get_or_create(
                    delivery_date=target_date,
                    defaults={
                        'total_packages': total_packages,
                        'total_kilos': total_kilos,
                        'duration_hours': 0,
                    }
                )
                
                if created:
                    delivery_history.completed_packages.set(delivered_packages)
                    self.stdout.write(
                        f'Created general delivery history: {total_packages} packages, {total_kilos} kg'
                    )
                else:
                    self.stdout.write('General delivery history already exists')
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error creating general delivery history: {str(e)}')
                )
        
        self.stdout.write(self.style.SUCCESS(f'Successfully updated delivery history for {target_date}')) 
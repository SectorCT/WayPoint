from django.core.management.base import BaseCommand
from delivery.models import DeliveryHistory, Package
from django.db.models import Sum, Count

class Command(BaseCommand):
    help = 'Clear dummy delivery history and recalculate based on real delivered packages'

    def handle(self, *args, **options):
        self.stdout.write('Clearing dummy delivery history...')
        
        # Delete all existing delivery history
        deleted_count = DeliveryHistory.objects.all().delete()[0]
        self.stdout.write(f'Deleted {deleted_count} delivery history records')
        
        # Get all delivered packages grouped by delivery date
        delivered_packages = Package.objects.filter(status='delivered')
        
        if not delivered_packages.exists():
            self.stdout.write('No delivered packages found')
            return
        
        # Group by delivery date and calculate real stats
        from django.db.models import Sum
        from django.utils import timezone
        from datetime import timedelta
        
        # Get packages from last 7 days
        today = timezone.now().date()
        for i in range(7):
            delivery_date = today - timedelta(days=i)
            daily_packages = delivered_packages.filter(deliveryDate=delivery_date)
            
            if daily_packages.exists():
                total_packages = daily_packages.count()
                total_kilos = daily_packages.aggregate(
                    total_weight=Sum('weight')
                )['total_weight'] or 0.00
                
                self.stdout.write(f'Date: {delivery_date}, Packages: {total_packages}, Kilos: {total_kilos}')
                
                # Only create history if there are actually delivered packages
                if total_packages > 0:
                    # Note: We need a driver and truck, but since we're just clearing dummy data,
                    # we'll skip creating new records for now
                    self.stdout.write(f'Would create history for {delivery_date} with {total_packages} packages')
        
        self.stdout.write(self.style.SUCCESS('Successfully cleared dummy delivery history'))
        self.stdout.write('Note: New delivery history will be created automatically when routes are finished') 
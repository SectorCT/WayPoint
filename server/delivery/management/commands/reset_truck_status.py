from django.core.management.base import BaseCommand
from delivery.models import Truck
from django.utils import timezone

class Command(BaseCommand):
    help = 'Resets the isUsed status of all trucks to False.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting truck status reset...'))
        
        try:
            updated_count = Truck.objects.update(isUsed=False)
            
            self.stdout.write(self.style.SUCCESS(
                f'Successfully reset status for {updated_count} trucks.'
            ))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(
                f'An error occurred during truck status reset: {e}'
            ))

        self.stdout.write(self.style.SUCCESS('Truck status reset process finished.')) 
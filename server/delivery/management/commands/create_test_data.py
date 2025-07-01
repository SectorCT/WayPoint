from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from delivery.models import Package, Truck
from django.utils import timezone
from datetime import timedelta
import random

User = get_user_model()

# Sofia, Bulgaria coordinates with slight variations for packages
SOFIA_CENTER = (42.6977, 23.3219)

# Sample addresses in Sofia
SOFIA_ADDRESSES = [
    "bul. Vitosha 89, Sofia, Bulgaria",
    "ul. Graf Ignatiev 6, Sofia, Bulgaria",
    "bul. Tsarigradsko Shose 115, Sofia, Bulgaria",
    "ul. Alabin 33, Sofia, Bulgaria",
    "bul. Cherni Vrah 100, Sofia, Bulgaria",
    "ul. Solunska 45, Sofia, Bulgaria",
    "bul. Bulgaria 102, Sofia, Bulgaria",
    "ul. Rakovski 96, Sofia, Bulgaria",
    "bul. Todor Aleksandrov 14, Sofia, Bulgaria",
    "ul. Pirotska 5, Sofia, Bulgaria"
]

class Command(BaseCommand):
    help = 'Creates test users, trucks, and packages for development'

    def handle(self, *args, **options):
        self.stdout.write('Creating test data...')
        
        # Create test users
        users_data = [
            {'email': 'r@r.com', 'username': 'r', 'is_staff': False},
            {'email': 'b@b.com', 'username': 'b', 'is_staff': False},
            {'email': 'c@c.com', 'username': 'c', 'is_staff': False},
            {'email': 'v@v.com', 'username': 'v', 'is_staff': False},
            {'email': 'z@z.com', 'username': 'z', 'is_staff': False},
            {'email': 'a@a.com', 'username': 'manager', 'is_staff': True, 'isManager': True}
        ]

        created_users = []
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                username=user_data['username'],
                defaults={
                    'is_staff': user_data['is_staff'],
                    'is_active': True,
                    'isManager': user_data.get('isManager', False)
                }
            )
            if created:
                user.set_password('radiradi')
                user.save()
                created_users.append(user)
                self.stdout.write(self.style.SUCCESS(f'Created user: {user.email}'))
            else:
                self.stdout.write(f'User {user.email} already exists')

        # Create trucks
        trucks_data = [
            {'licensePlate': 'CA1234BH', 'kilogramCapacity': 1000},
            {'licensePlate': 'CA5678BH', 'kilogramCapacity': 2000},
            {'licensePlate': 'CA9012BH', 'kilogramCapacity': 1500}
        ]

        for truck_data in trucks_data:
            truck, created = Truck.objects.get_or_create(
                licensePlate=truck_data['licensePlate'],
                defaults={'kilogramCapacity': truck_data['kilogramCapacity']}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created truck: {truck.licensePlate}'))
            else:
                self.stdout.write(f'Truck {truck.licensePlate} already exists')

        # Create packages
        today = timezone.now().date()
        tomorrow = today + timedelta(days=1)
        
        for i, address in enumerate(SOFIA_ADDRESSES):
            # Create slight variations in coordinates
            lat = SOFIA_CENTER[0] + random.uniform(-0.02, 0.02)
            lng = SOFIA_CENTER[1] + random.uniform(-0.02, 0.02)
            
            # Alternate between today and tomorrow for delivery dates
            delivery_date = today if i % 2 == 0 else tomorrow
            
            package = Package.objects.create(
                address=address,
                latitude=lat,
                longitude=lng,
                recipient=f'Test Recipient {i+1}',
                recipientPhoneNumber=f'+359888{100000 + i}',
                deliveryDate=delivery_date,
                weight=random.uniform(1.0, 20.0),
                status='pending'
            )
            self.stdout.write(self.style.SUCCESS(f'Created package: {package.packageID}'))

        self.stdout.write(self.style.SUCCESS('Test data creation complete!'))
        self.stdout.write('\nCredentials:')
        self.stdout.write('Driver 1: r@r.com / radiradi')
        self.stdout.write('Driver 2: aa.com / radiradi')
        self.stdout.write('Manager: a@a.com / radiradi') 
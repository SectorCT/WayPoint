from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from delivery.models import Package, Truck
from django.utils import timezone
from datetime import timedelta
import random
from authentication.models import Company

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
        
        # Create manager first
        manager_data = {'email': 'a@a.com', 'username': 'manager', 'is_staff': True, 'isManager': True}
        manager, _ = User.objects.get_or_create(
            email=manager_data['email'],
            username=manager_data['username'],
            defaults={
                'is_staff': manager_data['is_staff'],
                'is_active': True,
                'isManager': True
            }
        )
        manager.set_password('radiradi')
        manager.save()
        # Create company and assign manager
        company, _ = Company.objects.get_or_create(
            unique_id='COMPANY123',
            defaults={
                'name': 'Test Company',
                'manager': manager
            }
        )
        if company.manager != manager:
            company.manager = manager
            company.save()
        # Create truckers and assign to company
        trucker_users_data = [
            {'email': 'r@r.com', 'username': 'r'},
            {'email': 'b@b.com', 'username': 'b'},
            {'email': 'c@c.com', 'username': 'c'},
            {'email': 'v@v.com', 'username': 'v'},
            {'email': 'z@z.com', 'username': 'z'},
        ]
        for idx, user_data in enumerate(trucker_users_data):
            is_verified = idx < 2  # First two are verified, rest are not
            user, _ = User.objects.get_or_create(
                email=user_data['email'],
                username=user_data['username'],
                defaults={
                    'is_staff': False,
                    'is_active': True,
                    'isManager': False,
                    'company': company,
                    'verified': is_verified
                }
            )
            user.set_password('radiradi')
            user.company = company
            user.verified = is_verified
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Created trucker: {user.email} (company: {company.unique_id}, verified: {is_verified})'))

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
        self.stdout.write(f'Company ID: {company.unique_id}')
        for user_data in trucker_users_data:
            self.stdout.write(f"Trucker: {user_data['email']} / radiradi")
        self.stdout.write(f"Manager: {manager.email} / radiradi") 
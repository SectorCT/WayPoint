from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from delivery.models import Package, Truck
from delivery.models import Office
from django.utils import timezone
from datetime import timedelta
import random
from authentication.models import Company

User = get_user_model()

# Google HQ coordinates (warehouse location)
GOOGLE_HQ = (37.4220, -122.0841)

# Sample addresses spread across wider Bay Area neighborhoods
SAN_JOSE_ADDRESSES = [
    # Mountain View area (closest to Google HQ)
    "1600 Amphitheatre Parkway, Mountain View, CA 94043",  # Google HQ itself
    "2000 W El Camino Real, Mountain View, CA 94040",  # Mountain View
    "1000 N Shoreline Blvd, Mountain View, CA 94043",  # Mountain View
    "3000 Central Expressway, Mountain View, CA 94043",  # Mountain View
    
    # Sunnyvale area
    "16000 N Wolfe Rd, Sunnyvale, CA 94087",  # Sunnyvale
    "14000 W Fremont Ave, Sunnyvale, CA 94087",  # Sunnyvale
    "15000 E Fremont Ave, Sunnyvale, CA 94087",  # Sunnyvale
    "17000 S Wolfe Rd, Sunnyvale, CA 94087",  # Sunnyvale
    
    # Cupertino area
    "1 Infinite Loop, Cupertino, CA 95014",  # Apple Park
    "19000 W Homestead Rd, Cupertino, CA 95014",  # Cupertino
    "20000 N De Anza Blvd, Cupertino, CA 95014",  # Cupertino
    "13000 S De Anza Blvd, Cupertino, CA 95014",  # Cupertino
    
    # Los Altos area
    "1000 N San Antonio St, Los Altos, CA 94022",  # Los Altos
    "2000 Foothill Blvd, Los Altos, CA 94022",  # Los Altos
    "3000 Main St, Los Altos, CA 94022",  # Los Altos
    "4000 El Camino Real, Los Altos, CA 94022",  # Los Altos
    
    # Palo Alto area
    "3400 Hillview Ave, Palo Alto, CA 94304",  # Stanford Research Park
    "1000 El Camino Real, Menlo Park, CA 94025",  # Stanford Shopping Center
    "6000 Page Mill Rd, Palo Alto, CA 94304",  # Palo Alto
    "7000 Sand Hill Rd, Menlo Park, CA 94025",  # Menlo Park
    
    # San Jose area (further out)
    "2000 S Bascom Ave, Campbell, CA 95008",  # Campbell
    "3000 Stevens Creek Blvd, San Jose, CA 95128",  # San Jose
    "4000 Almaden Expy, San Jose, CA 95118",  # San Jose
    "5000 Blossom Hill Rd, San Jose, CA 95123",  # San Jose
    "6000 Santa Teresa Blvd, San Jose, CA 95119",  # San Jose
    "7000 Story Rd, San Jose, CA 95122",  # San Jose
    "8000 Monterey Rd, San Jose, CA 95112",  # San Jose
    "9000 S White Rd, San Jose, CA 95148",  # San Jose
    "10000 Berryessa Rd, San Jose, CA 95132",  # San Jose
    "11000 N 1st St, San Jose, CA 95134",  # San Jose
    "12000 E Calaveras Blvd, Milpitas, CA 95035",  # Milpitas
    "13000 S De Anza Blvd, Cupertino, CA 95014",  # Cupertino
    "14000 W Fremont Ave, Sunnyvale, CA 94087",  # Sunnyvale
    "15000 E Fremont Ave, Sunnyvale, CA 94087",  # Sunnyvale
    "16000 N Wolfe Rd, Sunnyvale, CA 94087",  # Sunnyvale
    "17000 S Wolfe Rd, Sunnyvale, CA 94087",  # Sunnyvale
    "18000 E Homestead Rd, Cupertino, CA 95014",  # Cupertino
    "19000 W Homestead Rd, Cupertino, CA 95014",  # Cupertino
    "20000 N De Anza Blvd, Cupertino, CA 95014"  # Cupertino
]

class Command(BaseCommand):
    help = 'Creates test users, trucks, and packages for development'

    def handle(self, *args, **options):
        self.stdout.write('Creating test data...')
        
        # Create manager first
        manager_data = {'email': 'sarah.chen@waypoint.delivery', 'username': 'sarah.chen', 'is_staff': True, 'isManager': True}
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
            unique_id='SFLOGISTICS2024',
            defaults={
                'name': 'San Francisco Bay Logistics',
                'manager': manager
            }
        )
        if company.manager != manager:
            company.manager = manager
            company.save()
        # Create truckers and assign to company
        trucker_users_data = [
            {'email': 'mike.rodriguez@waypoint.delivery', 'username': 'mike.rodriguez'},
            {'email': 'james.wong@waypoint.delivery', 'username': 'james.wong'},
            {'email': 'carlos.martinez@waypoint.delivery', 'username': 'carlos.martinez'},
            {'email': 'david.kim@waypoint.delivery', 'username': 'david.kim'},
            {'email': 'antonio.garcia@waypoint.delivery', 'username': 'antonio.garcia'},
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
            {'licensePlate': 'CA7ABC123', 'kilogramCapacity': 1000},
            {'licensePlate': 'CA8DEF456', 'kilogramCapacity': 2000},
            {'licensePlate': 'CA9GHI789', 'kilogramCapacity': 1500}
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

        # Create packages with better geographic distribution
        # Distribution: 20 packages for today, 5 packages for tomorrow
        today = timezone.now().date()
        tomorrow = today + timedelta(days=1)
        
        for i, address in enumerate(SAN_JOSE_ADDRESSES):
            # Create coordinates with better spread across the Bay Area
            # Use different ranges for different areas to create realistic distribution
            
            if i < 4:  # Mountain View area (closest to Google HQ)
                lat = GOOGLE_HQ[0] + random.uniform(-0.008, 0.008)
                lng = GOOGLE_HQ[1] + random.uniform(-0.008, 0.008)
            elif i < 8:  # Sunnyvale area
                lat = 37.3688 + random.uniform(-0.01, 0.01)
                lng = -122.0363 + random.uniform(-0.01, 0.01)
            elif i < 12:  # Cupertino area
                lat = 37.3318 + random.uniform(-0.01, 0.01)
                lng = -122.0312 + random.uniform(-0.01, 0.01)
            elif i < 16:  # Los Altos area
                lat = 37.3852 + random.uniform(-0.01, 0.01)
                lng = -122.1141 + random.uniform(-0.01, 0.01)
            elif i < 20:  # Palo Alto/Menlo Park area
                lat = 37.4419 + random.uniform(-0.01, 0.01)
                lng = -122.1430 + random.uniform(-0.01, 0.01)
            else:  # San Jose area (further out)
                lat = 37.3382 + random.uniform(-0.015, 0.015)
                lng = -121.8863 + random.uniform(-0.015, 0.015)
            
            # First 20 packages go to today, remaining 5 to tomorrow
            delivery_date = today if i < 20 else tomorrow
            
            # Realistic recipient names for San Francisco Bay Area
            recipient_names = [
                'Jennifer Liu', 'Robert Johnson', 'Maria Santos', 'David Chen', 'Lisa Thompson',
                'Michael Brown', 'Sarah Davis', 'James Wilson', 'Anna Rodriguez', 'Christopher Lee',
                'Emily Garcia', 'Daniel Martinez', 'Jessica White', 'Andrew Taylor', 'Michelle Anderson',
                'Kevin Thomas', 'Amanda Jackson', 'Ryan Harris', 'Nicole Martin', 'Brandon Thompson',
                'Stephanie Garcia', 'Tyler Martinez', 'Rachel Davis', 'Jordan Wilson', 'Ashley Brown'
            ]
            
            package = Package.objects.create(
                address=address,
                latitude=lat,
                longitude=lng,
                recipient=recipient_names[i % len(recipient_names)],
                recipientPhoneNumber=f'+1408{1000000 + i}',
                deliveryDate=delivery_date,
                weight=random.uniform(1.0, 20.0),
                status='pending',
                delivered_to_office=False
            )
            self.stdout.write(self.style.SUCCESS(f'Created package: {package.packageID}'))

        # Create offices for the company - San Jose area offices
        office_data = [
            {"name": "Google HQ Warehouse", "address": "1600 Amphitheatre Parkway, Mountain View, CA 94043", "latitude": 37.4220, "longitude": -122.0841, "company": company},
            {"name": "Mountain View Office", "address": "2000 W El Camino Real, Mountain View, CA 94040", "latitude": 37.3861, "longitude": -122.0839, "company": company},
            {"name": "Palo Alto Office", "address": "3400 Hillview Ave, Palo Alto, CA 94304", "latitude": 37.4419, "longitude": -122.1430, "company": company},
            {"name": "Cupertino Office", "address": "1 Infinite Loop, Cupertino, CA 95014", "latitude": 37.3318, "longitude": -122.0312, "company": company},
            {"name": "San Jose Office", "address": "3000 Stevens Creek Blvd, San Jose, CA 95128", "latitude": 37.3382, "longitude": -121.8863, "company": company}
        ]
        offices = []
        for od in office_data:
            office, _ = Office.objects.get_or_create(
                name=od["name"],
                address=od["address"],
                latitude=od["latitude"],
                longitude=od["longitude"],
                company=od["company"]
            )
            offices.append(office)
            self.stdout.write(self.style.SUCCESS(f'Created office: {office.name}'))

        # Assign some packages as undelivered and to offices
        for i, package in enumerate(Package.objects.all()[:4]):
            package.status = 'undelivered'
            package.office = offices[i % len(offices)]
            package.delivered_to_office = True
            package.save()
            self.stdout.write(self.style.SUCCESS(f'Assigned package {package.packageID} as undelivered to office {package.office.name}'))

        self.stdout.write(self.style.SUCCESS('Test data creation complete!'))
        self.stdout.write('\nCredentials:')
        self.stdout.write(f'Company ID: {company.unique_id}')
        for user_data in trucker_users_data:
            self.stdout.write(f"Trucker: {user_data['email']} / radiradi")
        self.stdout.write(f"Manager: {manager.email} / radiradi") 
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from delivery.models import Package, Truck
from delivery.models import Office
from django.utils import timezone
from datetime import timedelta
import random
from authentication.models import Company

User = get_user_model()

# Sofia depot. Routing reads the depot from the WAREHOUSE_* settings, so set them
# to these values (see .env.example) for routes to start and end here.
SOFIA_WAREHOUSE = {
    "name": "Sofia Central Warehouse",
    "address": "bul. Hristofor Kolumb 41, Sofia, Bulgaria",
    "latitude": 42.6835,
    "longitude": 23.3940,
}

# (address, latitude, longitude) spread across Sofia neighbourhoods.
# The first 20 are due today, the rest tomorrow.
SOFIA_ADDRESSES = [
    # Centre
    ("bul. Vitosha 45, Sofia", 42.6905, 23.3190),
    ("ul. Graf Ignatiev 12, Sofia", 42.6920, 23.3260),
    ("bul. Tsar Osvoboditel 15, Sofia", 42.6937, 23.3349),
    ("pl. Nezavisimost 1, Sofia", 42.6970, 23.3230),
    ("ul. Rakovski 108, Sofia", 42.6940, 23.3285),
    # Lozenets / NDK / South Park
    ("pl. Bulgaria 1, Sofia", 42.6847, 23.3190),
    ("ul. Krichim 20, Lozenets, Sofia", 42.6760, 23.3240),
    ("bul. Cherni vrah 100, Sofia", 42.6574, 23.3149),
    ("bul. Bulgaria 69, Sofia", 42.6640, 23.2890),
    # Mladost / Studentski grad / Business Park
    ("bul. Tsarigradsko shose 115, Sofia", 42.6604, 23.3836),
    ("bul. Andrey Lyapchev 25, Mladost 1, Sofia", 42.6530, 23.3790),
    ("Business Park Sofia, Mladost 4, Sofia", 42.6250, 23.3742),
    ("ul. Akad. Boris Stefanov 10, Studentski grad, Sofia", 42.6515, 23.3440),
    ("bul. Aleksandar Malinov 51, Mladost 4, Sofia", 42.6330, 23.3720),
    # Druzhba / Iztok / Geo Milev
    ("bul. Iskarsko shose 7, Druzhba 1, Sofia", 42.6640, 23.4010),
    ("ul. Nikolay Haytov 3, Iztok, Sofia", 42.6710, 23.3470),
    ("ul. Shipchenski prohod 63, Geo Milev, Sofia", 42.6850, 23.3610),
    # Serdika / Central Station / Nadezhda
    ("bul. Sitnyakovo 48, Sofia", 42.6922, 23.3526),
    ("bul. Knyaginya Maria Luiza 102, Sofia", 42.7117, 23.3212),
    ("bul. Lomsko shose 150, Nadezhda, Sofia", 42.7300, 23.3000),
    # Tomorrow: west - Mall of Sofia / Lyulin / Ovcha kupel / Krasna polyana
    ("bul. Aleksandar Stamboliyski 101, Sofia", 42.6983, 23.3080),
    ("bul. Pancho Vladigerov 21, Lyulin, Sofia", 42.7165, 23.2560),
    ("bul. Tsar Boris III 215, Sofia", 42.6780, 23.2660),
    ("ul. Montevideo 40, Ovcha kupel, Sofia", 42.6800, 23.2600),
    ("bul. Vardar 10, Krasna polyana, Sofia", 42.6990, 23.2830),
    # Tomorrow: north-east - Poduyane / Hadzhi Dimitar / Levski
    ("bul. Vladimir Vazov 30, Poduyane, Sofia", 42.7050, 23.3550),
    ("ul. Hadzhi Dimitar 40, Sofia", 42.7120, 23.3470),
    ("bul. Botevgradsko shose 100, Levski, Sofia", 42.7180, 23.3830),
    ("bul. Botevgradsko shose 247, Sofia", 42.7240, 23.4010),
    # Tomorrow: south - Dragalevtsi / Boyana / Manastirski livadi / Hladilnika
    ("ul. Yabalkova gradina 10, Dragalevtsi, Sofia", 42.6260, 23.3120),
    ("ul. Kumata 50, Boyana, Sofia", 42.6420, 23.2690),
    ("bul. Todor Kableshkov 57, Manastirski livadi, Sofia", 42.6580, 23.2960),
    ("bul. Nikola Vaptsarov 47, Hladilnika, Sofia", 42.6655, 23.3150),
    # Tomorrow: east - Airport / Slatina / Gorublyane
    ("bul. Brussels 1, Sofia Airport, Sofia", 42.6883, 23.4145),
    ("ul. Slatinska 50, Slatina, Sofia", 42.6850, 23.3780),
    ("bul. Tsarigradsko shose 247, Gorublyane, Sofia", 42.6450, 23.4180),
    ("ul. Samokovsko shose 2, Sofia", 42.6420, 23.4050),
]

RECIPIENT_NAMES = [
    'Maria Ivanova', 'Ivan Petrov', 'Elena Georgieva', 'Dimitar Nikolov', 'Nikolina Stoyanova',
    'Stefan Dimitrov', 'Yana Todorova', 'Hristo Kolev', 'Desislava Angelova', 'Todor Popov',
    'Gergana Vasileva', 'Aleksandar Mihaylov', 'Ralitsa Hristova', 'Boris Atanasov', 'Tsvetelina Ilieva',
    'Kaloyan Yordanov', 'Viktoria Pavlova', 'Martin Stefanov', 'Petya Marinova', 'Plamen Kostov',
    'Silvia Radeva', 'Emil Georgiev', 'Kristina Bozhilova', 'Radoslav Tsvetkov', 'Teodora Zheleva',
]


class Command(BaseCommand):
    help = 'Creates test users, trucks, packages and offices in Sofia, Bulgaria for development'

    def handle(self, *args, **options):
        self.stdout.write('Creating Sofia test data...')

        # Create manager first
        manager_data = {'email': 'sofia@abv.bg', 'username': 'sofia', 'is_staff': True, 'isManager': True}
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
            unique_id='SOFIA',
            defaults={
                'name': 'Sofia Logistics',
                'manager': manager
            }
        )
        if company.manager != manager:
            company.manager = manager
            company.save()
        # Create truckers and assign to company
        trucker_users_data = [
            {'email': 'georgi@abv.bg', 'username': 'georgi'},
            {'email': 'ivan@abv.bg', 'username': 'ivan'},
            {'email': 'dimitar@abv.bg', 'username': 'dimitar'},
            {'email': 'petar@abv.bg', 'username': 'petar'},
            {'email': 'nikolay@abv.bg', 'username': 'nikolay'},
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

        # Create trucks (Sofia plates)
        trucks_data = [
            {'licensePlate': 'CB1234AB', 'kilogramCapacity': 1000},
            {'licensePlate': 'CB5678KH', 'kilogramCapacity': 2000},
            {'licensePlate': 'CA9012TP', 'kilogramCapacity': 1500}
        ]

        for truck_data in trucks_data:
            truck, created = Truck.objects.get_or_create(
                licensePlate=truck_data['licensePlate'],
                defaults={'kilogramCapacity': truck_data['kilogramCapacity'], 'company': company}
            )
            if truck.company_id != company.id:
                truck.company = company
                truck.save()
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created truck: {truck.licensePlate}'))
            else:
                self.stdout.write(f'Truck {truck.licensePlate} already exists')

        # The first 20 addresses are due today and the rest tomorrow; 4 of
        # today's packages are then pre-marked undelivered (see below), so
        # 16 are left pending for today's route planning.
        # Business dates use the local date (settings.TIME_ZONE), like the views.
        today = timezone.localdate()
        tomorrow = today + timedelta(days=1)

        for i, (address, base_lat, base_lng) in enumerate(SOFIA_ADDRESSES):
            # Small jitter (~200 m) so repeated runs don't stack markers exactly
            lat = base_lat + random.uniform(-0.002, 0.002)
            lng = base_lng + random.uniform(-0.002, 0.002)

            delivery_date = today if i < 20 else tomorrow

            package = Package.objects.create(
                address=address,
                latitude=round(lat, 6),
                longitude=round(lng, 6),
                recipient=RECIPIENT_NAMES[i % len(RECIPIENT_NAMES)],
                recipientPhoneNumber=f'+35988{1000000 + i}',
                deliveryDate=delivery_date,
                weight=round(random.uniform(1.0, 20.0), 2),
                status='pending',
                delivered_to_office=False,
                company=company,
            )
            self.stdout.write(self.style.SUCCESS(f'Created package: {package.packageID}'))

        # Create offices for the company - Sofia offices
        office_data = [
            {**SOFIA_WAREHOUSE, "company": company},
            {"name": "Sofia Center Office", "address": "ul. Graf Ignatiev 20, Sofia", "latitude": 42.6915, "longitude": 23.3270, "company": company},
            {"name": "Mladost Office", "address": "bul. Andrey Lyapchev 51, Mladost 1, Sofia", "latitude": 42.6500, "longitude": 23.3800, "company": company},
            {"name": "Lyulin Office", "address": "bul. Pancho Vladigerov 60, Lyulin, Sofia", "latitude": 42.7140, "longitude": 23.2500, "company": company},
            {"name": "Lozenets Office", "address": "bul. Cherni vrah 47, Lozenets, Sofia", "latitude": 42.6700, "longitude": 23.3200, "company": company},
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
        for i, package in enumerate(Package.objects.filter(deliveryDate=today).order_by('id')[:4]):
            package.status = 'undelivered'
            package.office = offices[i % len(offices)]
            package.delivered_to_office = True
            package.save()
            self.stdout.write(self.style.SUCCESS(f'Assigned package {package.packageID} as undelivered to office {package.office.name}'))

        self.stdout.write(self.style.SUCCESS('Sofia test data creation complete!'))
        self.stdout.write('\nCredentials:')
        self.stdout.write(f'Company ID: {company.unique_id}')
        for user_data in trucker_users_data:
            self.stdout.write(f"Trucker: {user_data['email']} / radiradi")
        self.stdout.write(f"Manager: {manager.email} / radiradi")

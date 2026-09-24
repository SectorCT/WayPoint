"""Shared fixtures for the delivery API tests.

Two companies (A and B), each with a manager, truckers, trucks, packages and an
office. Trucker A1 has an active route with one of company A's packages; trucker
B has one with company B's package. OSRM is never called: `fake_osrm_trip`
returns a well-formed Trip response for whatever locations it is given.
"""
from datetime import timedelta
from unittest import mock

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from authentication.models import Company
from delivery.models import Office, Package, RouteAssignment, Truck
from delivery.routing import FACTORY_ADDRESS

User = get_user_model()


def fake_osrm_trip(locations):
    """Minimal OSRM Trip response visiting `locations` in input order."""
    coords = [[loc.lon, loc.lat] for loc in locations]
    return {
        "code": "Ok",
        "trips": [{
            "geometry": {"coordinates": coords + coords[:1]},
            "legs": [{"duration": 60.0, "steps": []} for _ in coords],
        }],
        "waypoints": [
            {"waypoint_index": i, "trips_index": 0, "location": c}
            for i, c in enumerate(coords)
        ],
    }


def route_sequence(*packages):
    """A stored packageSequence: ADMIN start followed by the given packages."""
    seq = [dict(FACTORY_ADDRESS["package_info"], location_index=0)]
    for i, pkg in enumerate(packages, start=1):
        seq.append({
            "packageID": pkg.packageID,
            "address": pkg.address,
            "latitude": float(pkg.latitude),
            "longitude": float(pkg.longitude),
            "recipient": pkg.recipient,
            "recipientPhoneNumber": pkg.recipientPhoneNumber,
            "deliveryDate": pkg.deliveryDate.isoformat(),
            "weight": float(pkg.weight),
            "status": pkg.status,
            "location_index": i,
        })
    return seq


class ApiTestBase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.today = timezone.localdate()
        cls.tomorrow = cls.today + timedelta(days=1)

        cls.company_a, cls.manager_a = cls._make_company('COMPA', 'manager.a')
        cls.company_b, cls.manager_b = cls._make_company('COMPB', 'manager.b')

        cls.trucker_a1 = cls._make_trucker('trucker.a1', cls.company_a)
        cls.trucker_a2 = cls._make_trucker('trucker.a2', cls.company_a)
        cls.trucker_b = cls._make_trucker('trucker.b', cls.company_b)

        cls.truck_a = Truck.objects.create(licensePlate='A-ROUTE', kilogramCapacity=1000, isUsed=True, company=cls.company_a)
        cls.truck_a_spare = Truck.objects.create(licensePlate='A-SPARE', kilogramCapacity=1000, company=cls.company_a)
        cls.truck_b = Truck.objects.create(licensePlate='B-ROUTE', kilogramCapacity=1000, isUsed=True, company=cls.company_b)

        cls.pkg_a_route = cls._make_package(cls.company_a, cls.today, 'in_transit', 'A route pkg')
        cls.pkg_a_pending = cls._make_package(cls.company_a, cls.today, 'pending', 'A pending today')
        cls.pkg_a_tomorrow = cls._make_package(cls.company_a, cls.tomorrow, 'pending', 'A pending tomorrow')
        cls.pkg_b_route = cls._make_package(cls.company_b, cls.today, 'in_transit', 'B route pkg')
        cls.pkg_b_pending = cls._make_package(cls.company_b, cls.today, 'pending', 'B pending today')

        cls.office_a = Office.objects.create(name='Office A', address='A st', latitude=37.40, longitude=-122.05, company=cls.company_a)
        cls.office_b = Office.objects.create(name='Office B', address='B st', latitude=37.30, longitude=-121.90, company=cls.company_b)

        cls.route_a1 = RouteAssignment.objects.create(
            driver=cls.trucker_a1, truck=cls.truck_a,
            packageSequence=route_sequence(cls.pkg_a_route), mapRoute=[[-122.0, 37.4], [-122.1, 37.5]],
        )
        cls.route_b = RouteAssignment.objects.create(
            driver=cls.trucker_b, truck=cls.truck_b,
            packageSequence=route_sequence(cls.pkg_b_route), mapRoute=[[-121.9, 37.3], [-121.8, 37.2]],
        )

    @staticmethod
    def _make_company(code, manager_username):
        manager = User.objects.create_user(
            email=f'{manager_username}@test.local', username=manager_username,
            phoneNumber='5550000', password='pw-123456', isManager=True, verified=True,
        )
        company = Company.objects.create(unique_id=code, name=f'Company {code}', manager=manager)
        manager.company = company
        manager.save()
        return company, manager

    @staticmethod
    def _make_trucker(username, company):
        return User.objects.create_user(
            email=f'{username}@test.local', username=username, phoneNumber='5551111',
            password='pw-123456', isManager=False, verified=True, company=company,
        )

    @staticmethod
    def _make_package(company, delivery_date, status, recipient):
        return Package.objects.create(
            address=f'{recipient} address', latitude=37.39, longitude=-122.08,
            recipient=recipient, recipientPhoneNumber='4081234567',
            deliveryDate=delivery_date, weight=5, status=status, company=company,
            recipientEmail='',
        )

    def setUp(self):
        patcher = mock.patch('delivery.routing.osrm_trip', side_effect=fake_osrm_trip)
        self.osrm = patcher.start()
        self.addCleanup(patcher.stop)

    def as_user(self, user):
        self.client.force_authenticate(user=user)

    def call(self, method, path, data=None):
        return getattr(self.client, method)(f'/v1/{path}', data, format='json')

    def assertNoDebugInfo(self, response):
        body = response.json() if response.content else {}
        if isinstance(body, dict):
            self.assertNotIn('trace', body)
            self.assertNotIn('exception', body)
            self.assertNotIn('details', body)

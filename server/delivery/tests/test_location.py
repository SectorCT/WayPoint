"""Live truck positions: POST delivery/location/ and GET delivery/locations/."""
from delivery.models import RouteAssignment, TruckerLocation

from .base import ApiTestBase


class LocationUpdateTests(ApiTestBase):
    def setUp(self):
        super().setUp()
        self.as_user(self.trucker_a1)

    def test_stores_and_returns_the_position(self):
        response = self.call('post', 'delivery/location/', {
            'latitude': 37.4219983, 'longitude': -122.084, 'heading': 90.5, 'speed': 12.3, 'accuracy': 5,
        })
        self.assertEqual(response.status_code, 200, response.content)
        body = response.json()
        self.assertEqual(body['driver'], 'trucker.a1')
        self.assertEqual(body['latitude'], 37.4219983)
        self.assertEqual(body['heading'], 90.5)
        self.assertIn('recorded_at', body)

    def test_repeated_updates_keep_one_row(self):
        self.call('post', 'delivery/location/', {'latitude': 1, 'longitude': 1, 'speed': 3})
        response = self.call('post', 'delivery/location/', {'latitude': 2, 'longitude': 2})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(TruckerLocation.objects.filter(user=self.trucker_a1).count(), 1)
        location = TruckerLocation.objects.get(user=self.trucker_a1)
        self.assertEqual((location.latitude, location.longitude, location.speed), (2, 2, None))

    def test_validation(self):
        bad_bodies = [
            {},
            {'latitude': 37},
            {'latitude': 91, 'longitude': 0},
            {'latitude': -91, 'longitude': 0},
            {'latitude': 0, 'longitude': 181},
            {'latitude': 0, 'longitude': -181},
            {'latitude': 'north', 'longitude': 0},
            {'latitude': 0, 'longitude': 0, 'heading': 360},
            {'latitude': 0, 'longitude': 0, 'heading': -1},
            {'latitude': 0, 'longitude': 0, 'speed': -1},
            {'latitude': 0, 'longitude': 0, 'accuracy': -0.5},
        ]
        for body in bad_bodies:
            with self.subTest(body=body):
                response = self.call('post', 'delivery/location/', body)
                self.assertEqual(response.status_code, 400)
                self.assertIn('errors', response.json())
        self.assertFalse(TruckerLocation.objects.exists())

    def test_nulls_are_accepted_for_optional_fields(self):
        response = self.call('post', 'delivery/location/', {
            'latitude': 0, 'longitude': 0, 'heading': None, 'speed': None, 'accuracy': None,
        })
        self.assertEqual(response.status_code, 200)

    def test_only_truckers_can_post(self):
        self.as_user(self.manager_a)
        self.assertEqual(self.call('post', 'delivery/location/', {'latitude': 0, 'longitude': 0}).status_code, 403)
        self.client.force_authenticate(user=None)
        self.assertEqual(self.call('post', 'delivery/location/', {'latitude': 0, 'longitude': 0}).status_code, 401)


class CompanyLocationsTests(ApiTestBase):
    def setUp(self):
        super().setUp()
        for trucker, lat in ((self.trucker_a1, 37.1), (self.trucker_a2, 37.2), (self.trucker_b, 37.3)):
            TruckerLocation.objects.create(user=trucker, latitude=lat, longitude=-122.0)
        self.as_user(self.manager_a)

    def test_lists_own_company_truckers_with_active_routes(self):
        # trucker.a2 has a position but no active route; trucker.b is another company's.
        response = self.call('get', 'delivery/locations/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [{
            'driver': 'trucker.a1',
            'latitude': 37.1,
            'longitude': -122.0,
            'heading': None,
            'speed': None,
            'accuracy': None,
            'recorded_at': TruckerLocation.objects.get(user=self.trucker_a1).recorded_at.isoformat(),
            'routeID': self.route_a1.routeID,
            'truck': 'A-ROUTE',
        }])

    def test_finished_route_hides_the_trucker(self):
        RouteAssignment.objects.filter(pk=self.route_a1.pk).update(isActive=False)
        self.assertEqual(self.call('get', 'delivery/locations/').json(), [])

    def test_active_route_without_position_is_omitted(self):
        TruckerLocation.objects.filter(user=self.trucker_a1).delete()
        self.assertEqual(self.call('get', 'delivery/locations/').json(), [])

    def test_other_company_manager_sees_only_their_truckers(self):
        self.as_user(self.manager_b)
        self.assertEqual([p['driver'] for p in self.call('get', 'delivery/locations/').json()], ['trucker.b'])

    def test_truckers_cannot_list_positions(self):
        self.as_user(self.trucker_a1)
        self.assertEqual(self.call('get', 'delivery/locations/').status_code, 403)

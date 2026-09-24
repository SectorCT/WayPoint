"""Company isolation, trucker route ownership and error-body hygiene."""
from datetime import timedelta

from delivery.models import Package, RouteAssignment, Truck

from .base import ApiTestBase, route_sequence


class CompanyScopingTests(ApiTestBase):
    def setUp(self):
        super().setUp()
        self.as_user(self.manager_a)

    def ids(self, response, key):
        self.assertEqual(response.status_code, 200, response.content)
        return {item[key] for item in response.json()}

    def test_packages_are_company_scoped(self):
        ids = self.ids(self.call('get', 'delivery/packages/'), 'packageID')
        self.assertIn(self.pkg_a_pending.packageID, ids)
        self.assertNotIn(self.pkg_b_pending.packageID, ids)
        self.assertEqual(self.call('get', f'delivery/packages/{self.pkg_b_pending.packageID}/').status_code, 404)

    def test_today_pending_excludes_other_companies_and_tomorrow(self):
        ids = self.ids(self.call('get', 'delivery/packages/today-pending/'), 'packageID')
        self.assertEqual(ids, {self.pkg_a_pending.packageID})

    def test_statistics_are_company_scoped_and_consistent_with_today_pending(self):
        stats = self.call('get', 'delivery/statistics/').json()
        self.assertEqual(stats['package_stats']['total'], 3)
        self.assertEqual(stats['package_stats']['pending'], 2)
        self.assertEqual(stats['truck_stats']['total'], 2)
        self.assertEqual(stats['summary_stats']['total_drivers'], 2)
        self.assertEqual(stats['summary_stats']['active_routes'], 1)
        today_pending = self.call('get', 'delivery/packages/today-pending/').json()
        # The dashboard's "upcoming" figure: pending minus due-today.
        self.assertEqual(stats['package_stats']['pending'] - len(today_pending), 1)

    def test_trucks_are_company_scoped(self):
        plates = self.ids(self.call('get', 'delivery/trucks/'), 'licensePlate')
        self.assertEqual(plates, {'A-ROUTE', 'A-SPARE'})
        self.assertEqual(self.ids(self.call('get', 'delivery/trucks/available/'), 'licensePlate'), {'A-SPARE'})
        self.assertEqual(self.call('delete', 'delivery/trucks/B-ROUTE/').status_code, 404)
        self.assertTrue(Truck.objects.filter(licensePlate='B-ROUTE').exists())

    def test_created_objects_belong_to_the_managers_company(self):
        self.call('post', 'delivery/trucks/create/', {'licensePlate': 'NEW-1', 'kilogramCapacity': 500})
        self.assertEqual(Truck.objects.get(licensePlate='NEW-1').company, self.company_a)
        response = self.call('post', 'delivery/packages/create/', {
            'address': '1 Test Way', 'latitude': 37.4, 'longitude': -122.1,
            'recipient': 'New Person', 'recipientPhoneNumber': '4085550000',
            'deliveryDate': self.today.isoformat(), 'weight': 2.5,
        })
        self.assertEqual(response.status_code, 201)
        package_id = response.json()['package']['packageID']
        self.assertEqual(Package.objects.get(packageID=package_id).company, self.company_a)

    def test_recipient_email_is_optional(self):
        body = {
            'address': '1 Test Way', 'latitude': 37.4, 'longitude': -122.1,
            'recipient': 'New Person', 'recipientPhoneNumber': '4085550000',
            'deliveryDate': self.today.isoformat(), 'weight': 2.5,
        }
        response = self.call('post', 'delivery/packages/create/', body)
        self.assertIsNone(response.json()['package']['recipientEmail'])
        response = self.call('post', 'delivery/packages/create/', dict(body, recipientEmail='person@example.com'))
        package = Package.objects.get(packageID=response.json()['package']['packageID'])
        self.assertEqual(package.recipientEmail, 'person@example.com')

    def test_users_are_company_scoped(self):
        usernames = self.ids(self.call('get', 'auth/all/'), 'username')
        self.assertEqual(usernames, {'manager.a', 'trucker.a1', 'trucker.a2'})
        self.assertEqual(self.call('post', 'auth/getUser/', {'username': 'trucker.b'}).status_code, 404)

    def test_routes_are_company_scoped(self):
        users = self.ids(self.call('get', 'delivery/route/all/'), 'user')
        self.assertEqual(users, {'trucker.a1'})
        response = self.call('post', 'delivery/route/checkDriverStatus/', {'username': 'trucker.b'})
        self.assertEqual(response.status_code, 403)
        response = self.call('post', 'delivery/route/getByDriver/', {'username': 'trucker.b'})
        self.assertEqual(response.status_code, 403)

    def test_cannot_plan_or_assign_other_company_drivers_or_trucks(self):
        self.assertEqual(self.call('post', 'delivery/route/', {'drivers': ['trucker.b']}).status_code, 403)
        response = self.call('post', 'delivery/route/assign/', {
            'driverUsername': 'trucker.a2', 'truckLicensePlate': 'B-ROUTE',
            'packageSequence': [{'packageID': self.pkg_a_pending.packageID}], 'mapRoute': [[0, 0]],
        })
        self.assertEqual(response.status_code, 404)

    def test_route_planning_uses_only_own_packages_and_free_trucks(self):
        response = self.call('post', 'delivery/route/', {'drivers': ['trucker.a2']})
        self.assertEqual(response.status_code, 201, response.content)
        [route] = response.json()
        self.assertEqual(route['truck'], 'A-SPARE')
        planned = {p['packageID'] for p in route['packageSequence']} - {'ADMIN'}
        self.assertEqual(planned, {self.pkg_a_pending.packageID})

    def test_offices_are_company_scoped(self):
        self.assertEqual(self.ids(self.call('get', 'delivery/offices/'), 'id'), {self.office_a.id})
        self.assertEqual(self.call('get', f'delivery/offices/{self.office_b.id}/').status_code, 404)
        response = self.call('post', 'delivery/offices/', {
            'name': 'Sneaky', 'address': 'x', 'latitude': 37.1, 'longitude': -122.1,
            'company': self.company_b.id,
        })
        self.assertEqual(response.status_code, 403)

    def test_unverified_truckers_and_verify_are_company_scoped(self):
        response = self.call('post', 'delivery/truckers/verify/', {'username': 'trucker.b'})
        self.assertEqual(response.status_code, 403)


class TruckerOwnershipTests(ApiTestBase):
    def setUp(self):
        super().setUp()
        # trucker.a2 gets their own route so "not on your route" is the only reason to refuse.
        self.route_a2 = RouteAssignment.objects.create(
            driver=self.trucker_a2, truck=self.truck_a_spare,
            packageSequence=route_sequence(self.pkg_a_pending), mapRoute=[],
        )
        self.as_user(self.trucker_a2)

    def test_cannot_read_another_truckers_route(self):
        response = self.call('post', 'delivery/route/getByDriver/', {'username': 'trucker.a1'})
        self.assertEqual(response.status_code, 403)

    def test_username_is_optional_and_defaults_to_caller(self):
        response = self.call('post', 'delivery/route/getByDriver/', {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['driver'], 'trucker.a2')

    def test_cannot_mark_packages_on_another_route(self):
        for path in ('delivery/packages_mark/', 'delivery/packages_mark_undelivered/'):
            with self.subTest(path=path):
                response = self.call('post', path, {'packageID': self.pkg_a_route.packageID})
                self.assertEqual(response.status_code, 403)
        self.pkg_a_route.refresh_from_db()
        self.assertEqual(self.pkg_a_route.status, 'in_transit')

    def test_can_mark_own_package(self):
        response = self.call('post', 'delivery/packages_mark/', {'packageID': self.pkg_a_pending.packageID})
        self.assertEqual(response.status_code, 200)
        self.pkg_a_pending.refresh_from_db()
        self.assertEqual(self.pkg_a_pending.status, 'delivered')
        # Last package on the route: route closes and the truck is released.
        self.route_a2.refresh_from_db()
        self.assertFalse(self.route_a2.isActive)

    def test_cannot_finish_or_recalculate_another_truckers_route(self):
        response = self.call('post', 'delivery/route/finish/', {'username': 'trucker.a1'})
        self.assertEqual(response.status_code, 403)
        response = self.call('post', 'delivery/route/recalculate/', {'username': 'trucker.a1', 'currentLat': 1, 'currentLng': 1})
        self.assertEqual(response.status_code, 403)
        self.route_a1.refresh_from_db()
        self.assertTrue(self.route_a1.isActive)

    def test_office_endpoints_are_scoped_to_caller(self):
        response = self.call('get', 'delivery/offices/undelivered_route/trucker.a1/')
        self.assertEqual(response.status_code, 403)
        response = self.call('post', 'delivery/office-delivery/', {
            'driver_username': 'trucker.a2', 'office_id': self.office_b.id, 'package_ids': [],
        })
        self.assertEqual(response.status_code, 404)

    def test_driver_with_older_routes_can_still_fetch_current_route(self):
        # Regression: RouteAssignment.objects.get(driver=...) raised
        # MultipleObjectsReturned once a driver had more than one route.
        old = RouteAssignment.objects.create(
            driver=self.trucker_a2, truck=self.truck_a_spare, packageSequence=[], mapRoute=[], isActive=False,
        )
        RouteAssignment.objects.filter(pk=old.pk).update(dateOfCreation=self.today - timedelta(days=3))
        response = self.call('post', 'delivery/route/getByDriver/', {'username': 'trucker.a2'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['packageSequence'], self.route_a2.packageSequence)


class ErrorBodyTests(ApiTestBase):
    def setUp(self):
        super().setUp()
        self.as_user(self.manager_a)

    def test_plan_for_driver_with_active_route_returns_errors_without_trace(self):
        response = self.call('post', 'delivery/route/', {'drivers': ['trucker.a1']})
        self.assertEqual(response.status_code, 400)
        body = response.json()
        self.assertEqual(body['errors'], ["Driver 'trucker.a1' already has an active route."])
        self.assertNoDebugInfo(response)
        # Nothing was persisted.
        self.pkg_a_pending.refresh_from_db()
        self.assertEqual(self.pkg_a_pending.status, 'pending')

    def test_osrm_failure_returns_502_without_details(self):
        self.osrm.side_effect = lambda locations: {'error': 'request', 'exception': 'boom at /home/app'}
        response = self.call('post', 'delivery/route/', {'drivers': ['trucker.a2']})
        self.assertEqual(response.status_code, 502)
        self.assertNoDebugInfo(response)
        self.assertNotIn('/home/app', response.content.decode())

    def test_validation_error_list_is_wrapped_in_errors(self):
        response = self.call('post', 'delivery/packages/create/', {'address': 'x'})
        self.assertEqual(response.status_code, 400)
        self.assertIn('errors', response.json())

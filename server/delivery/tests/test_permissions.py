"""Role matrix for every API endpoint: anonymous → 401, wrong role → 403,
correct role → 2xx."""
from django.db import transaction

from .base import ApiTestBase

MANAGER = 'manager'
TRUCKER = 'trucker'


class PermissionMatrixTests(ApiTestBase):
    def endpoints(self):
        """(role, method, path, body) for each endpoint the role may call."""
        a1 = self.trucker_a1.username
        new_package = {
            'address': '1 Test Way', 'latitude': 37.4, 'longitude': -122.1,
            'recipient': 'New Person', 'recipientPhoneNumber': '4085550000',
            'deliveryDate': self.today.isoformat(), 'weight': 2.5,
        }
        return [
            # Manager endpoints
            (MANAGER, 'get', 'auth/all/', None),
            (MANAGER, 'post', 'auth/getUser/', {'username': a1}),
            (MANAGER, 'get', 'delivery/packages/', None),
            (MANAGER, 'get', 'delivery/packages/today-pending/', None),
            (MANAGER, 'post', 'delivery/packages/create/', new_package),
            (MANAGER, 'post', 'delivery/packages/createMany/', {'packages': [new_package]}),
            (MANAGER, 'get', f'delivery/packages/{self.pkg_a_pending.packageID}/', None),
            (MANAGER, 'get', 'delivery/trucks/', None),
            (MANAGER, 'post', 'delivery/trucks/create/', {'licensePlate': 'NEW-1', 'kilogramCapacity': 500}),
            (MANAGER, 'get', 'delivery/trucks/available/', None),
            (MANAGER, 'delete', f'delivery/trucks/{self.truck_a_spare.licensePlate}/', None),
            (MANAGER, 'post', 'delivery/route/', {'drivers': [self.trucker_a2.username]}),
            (MANAGER, 'post', 'delivery/route/assign/', {
                'driverUsername': self.trucker_a2.username,
                'truckLicensePlate': self.truck_a_spare.licensePlate,
                'packageSequence': [{'packageID': self.pkg_a_pending.packageID}],
                'mapRoute': [[-122.0, 37.4]],
            }),
            (MANAGER, 'get', 'delivery/route/all/', None),
            (MANAGER, 'delete', 'delivery/route/dropAll/', None),
            (MANAGER, 'post', 'delivery/route/checkDriverStatus/', {'username': a1}),
            (MANAGER, 'get', 'delivery/history/', None),
            (MANAGER, 'post', 'delivery/history/create/', {'username': a1}),
            (MANAGER, 'get', f'delivery/history/detailed/?date={self.today.isoformat()}', None),
            (MANAGER, 'post', 'delivery/history/create-today/', {}),
            (MANAGER, 'get', 'delivery/truckers/unverified/', None),
            (MANAGER, 'post', 'delivery/truckers/verify/', {'username': self.trucker_a2.username}),
            (MANAGER, 'get', 'delivery/offices/', None),
            (MANAGER, 'post', 'delivery/offices/', {
                'name': 'New', 'address': 'x', 'latitude': 37.1, 'longitude': -122.1,
                'company': self.company_a.id,
            }),
            (MANAGER, 'get', f'delivery/offices/{self.office_a.id}/', None),
            (MANAGER, 'get', f'delivery/offices/{self.office_a.id}/undelivered/', None),
            (MANAGER, 'get', 'delivery/statistics/', None),
            (MANAGER, 'get', 'delivery/locations/', None),
            (TRUCKER, 'post', 'delivery/location/', {'latitude': 37.4, 'longitude': -122.0}),
            # Trucker endpoints
            (TRUCKER, 'post', 'delivery/packages_mark/', {'packageID': self.pkg_a_route.packageID, 'signature': 'data:image/png;base64,AA=='}),
            (TRUCKER, 'post', 'delivery/packages_mark_undelivered/', {'packageID': self.pkg_a_route.packageID}),
            (TRUCKER, 'post', 'delivery/route/recalculate/', {'username': a1, 'currentLat': 37.4, 'currentLng': -122.0}),
            (TRUCKER, 'post', 'delivery/route/finish/', {'username': a1}),
            (TRUCKER, 'post', 'delivery/route/return/', {'currentLat': 37.4, 'currentLng': -122.0, 'defaultLat': 37.42, 'defaultLng': -122.08}),
            (TRUCKER, 'get', f'delivery/offices/undelivered_route/{a1}/', None),
            (TRUCKER, 'post', 'delivery/route/optimize-office/', {
                'driver_username': a1, 'current_lat': 37.4, 'current_lng': -122.0,
                'office_ids': [self.office_a.id],
            }),
            (TRUCKER, 'post', 'delivery/office-delivery/', {
                'driver_username': a1, 'office_id': self.office_a.id,
                'package_ids': [self.pkg_a_route.packageID],
            }),
        ]

    def user_for(self, role):
        return self.manager_a if role == MANAGER else self.trucker_a1

    def call_isolated(self, method, path, data):
        """Call the endpoint and roll back its side effects."""
        with transaction.atomic():
            response = self.call(method, path, data)
            transaction.set_rollback(True)
        return response

    def test_anonymous_gets_401(self):
        for role, method, path, data in self.endpoints():
            with self.subTest(path=path, method=method):
                response = self.call_isolated(method, path, data)
                self.assertEqual(response.status_code, 401, response.content)

    def test_wrong_role_gets_403(self):
        for role, method, path, data in self.endpoints():
            with self.subTest(path=path, method=method):
                self.as_user(self.user_for(TRUCKER if role == MANAGER else MANAGER))
                response = self.call_isolated(method, path, data)
                self.assertEqual(response.status_code, 403, response.content)

    def test_correct_role_succeeds(self):
        for role, method, path, data in self.endpoints():
            with self.subTest(path=path, method=method):
                self.as_user(self.user_for(role))
                response = self.call_isolated(method, path, data)
                self.assertTrue(200 <= response.status_code < 300, f'{response.status_code}: {response.content[:300]}')
                self.assertNoDebugInfo(response)

    def test_get_by_driver_allows_trucker_and_manager(self):
        path, body = 'delivery/route/getByDriver/', {'username': self.trucker_a1.username}
        self.assertEqual(self.call('post', path, body).status_code, 401)
        for user in (self.trucker_a1, self.manager_a):
            self.as_user(user)
            self.assertEqual(self.call('post', path, body).status_code, 200)

    def test_public_auth_endpoints_do_not_require_a_token(self):
        response = self.call('post', 'auth/login/', {'email': 'trucker.a1@test.local', 'password': 'pw-123456'})
        self.assertEqual(response.status_code, 200)
        tokens = response.json()

        response = self.call('post', 'auth/token/refresh/', {'refresh': tokens['refresh']})
        self.assertEqual(response.status_code, 200)
        # Refresh tokens rotate; the old one is blacklisted, the new one logs out.
        # The Flutter client logs out without an access token.
        rotated = response.json()['refresh']
        self.assertEqual(self.call('post', 'auth/logout/', {'refresh': tokens['refresh']}).status_code, 400)
        self.assertEqual(self.call('post', 'auth/logout/', {'refresh': rotated}).status_code, 205)

        response = self.call('post', 'auth/register/', {
            'email': 'new@test.local', 'username': 'new.trucker', 'phoneNumber': '5552222',
            'password': 'long-password-1', 'password2': 'long-password-1',
            'isManager': False, 'company_id': 'COMPA',
        })
        self.assertEqual(response.status_code, 200, response.content)

    def test_login_with_bad_token_header_still_works(self):
        # A stale Authorization header must not block the public endpoints.
        self.client.credentials(HTTP_AUTHORIZATION='Bearer not-a-real-token')
        response = self.call('post', 'auth/login/', {'email': 'manager.a@test.local', 'password': 'pw-123456'})
        self.assertEqual(response.status_code, 200)

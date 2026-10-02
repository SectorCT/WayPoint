"""Turn-by-turn routes for the driver view: `route/navigate/` and the
`return_to_warehouse` flag on `route/optimize-office/`.

The OSRM HTTP call (`requests.get` in delivery.routing) is mocked everywhere.
"""
import json
from unittest import mock
from urllib.parse import parse_qs, urlsplit

from django.conf import settings
from django.db import connection
from django.test.utils import CaptureQueriesContext

from delivery import routing
from delivery.models import Office

from .base import ApiTestBase

real_osrm_trip = routing.osrm_trip

NAVIGATE = 'delivery/route/navigate/'
OFFICE = 'delivery/route/optimize-office/'

FROM = {'lat': 42.6853, 'lng': 23.3190}
TO = [{'lat': 42.6957, 'lng': 23.3285}, {'lat': 42.6853, 'lng': 23.3190}]

STEP = {
    'maneuver': {'type': 'depart', 'modifier': 'right', 'location': [23.319, 42.6853], 'bearing_after': 88},
    'name': 'bul. Vitosha', 'distance': 120.4, 'duration': 18.2,
    'geometry': {'type': 'LineString', 'coordinates': [[23.319, 42.6853], [23.3201, 42.686]]},
}


def http(payload, status_code=200):
    resp = mock.Mock(status_code=status_code, text=json.dumps(payload))
    resp.json.return_value = payload
    return resp


def route_ok(n_legs):
    return {
        'code': 'Ok',
        'routes': [{
            'geometry': {'type': 'LineString', 'coordinates': [[23.319, 42.6853], [23.3201, 42.686], [23.3285, 42.6957]]},
            'legs': [{'steps': [STEP], 'distance': 1000.0, 'duration': 100.0, 'summary': ''} for _ in range(n_legs)],
            'distance': 4321.5,
            'duration': 612.3,
        }],
        'waypoints': [],
    }


def query(url):
    return parse_qs(urlsplit(url).query, keep_blank_values=True)


class NavigateRouteTests(ApiTestBase):
    def setUp(self):
        super().setUp()
        patcher = mock.patch('delivery.routing.requests.get')
        self.get = patcher.start()
        self.addCleanup(patcher.stop)
        self.as_user(self.trucker_a1)

    def urls(self):
        return [c.args[0] for c in self.get.call_args_list]

    def test_happy_path_with_bearing(self):
        self.get.return_value = http(route_ok(2))
        response = self.call('post', NAVIGATE, {'from': FROM, 'bearing': 87.5, 'to': TO})

        self.assertEqual(response.status_code, 200, response.content)
        [url] = self.urls()
        path = urlsplit(url).path
        self.assertEqual(
            path,
            f'/route/v1/{settings.OSRM_PROFILE}/23.319,42.6853;23.3285,42.6957;23.319,42.6853',
        )
        self.assertTrue(url.startswith(f'{settings.OSRM_BASE_URL}/route/v1/'))
        q = query(url)
        self.assertEqual(q['bearings'], ['88,45;;'])
        self.assertEqual(q['steps'], ['true'])
        self.assertEqual(q['geometries'], ['geojson'])
        self.assertEqual(q['overview'], ['full'])

        body = response.json()
        self.assertEqual(set(body), {'coordinates', 'legs', 'distance', 'duration'})
        expected = route_ok(2)['routes'][0]
        self.assertEqual(body['coordinates'], expected['geometry']['coordinates'])
        self.assertEqual(body['legs'], expected['legs'])
        self.assertEqual(body['distance'], 4321.5)
        self.assertEqual(body['duration'], 612.3)

    def test_without_bearing_sends_no_bearings(self):
        self.get.return_value = http(route_ok(1))
        response = self.call('post', NAVIGATE, {'from': FROM, 'to': TO[:1]})

        self.assertEqual(response.status_code, 200, response.content)
        [url] = self.urls()
        self.assertNotIn('bearings', url)

    def test_null_bearing_is_no_bearing(self):
        self.get.return_value = http(route_ok(1))
        response = self.call('post', NAVIGATE, {'from': FROM, 'bearing': None, 'to': TO[:1]})

        self.assertEqual(response.status_code, 200, response.content)
        self.assertNotIn('bearings', self.urls()[0])

    def test_no_route_with_bearing_retries_without_it(self):
        self.get.side_effect = [
            http({'code': 'NoRoute', 'message': 'Impossible route between points'}, status_code=400),
            http(route_ok(2)),
        ]
        response = self.call('post', NAVIGATE, {'from': FROM, 'bearing': 87.5, 'to': TO})

        self.assertEqual(response.status_code, 200, response.content)
        first, second = self.urls()
        self.assertIn('bearings=88,45;;', first)
        self.assertNotIn('bearings', second)

    def test_no_route_without_bearing_is_502(self):
        self.get.return_value = http({'code': 'NoRoute'}, status_code=400)
        response = self.call('post', NAVIGATE, {'from': FROM, 'to': TO})

        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.json(), {'error': 'Routing service unavailable'})
        self.assertEqual(self.get.call_count, 1)

    def test_no_route_after_retry_is_502(self):
        self.get.return_value = http({'code': 'NoRoute'}, status_code=400)
        response = self.call('post', NAVIGATE, {'from': FROM, 'bearing': 10, 'to': TO})

        self.assertEqual(response.status_code, 502)
        self.assertEqual(self.get.call_count, 2)

    def test_osrm_down_is_502(self):
        self.get.side_effect = ConnectionError('boom')
        response = self.call('post', NAVIGATE, {'from': FROM, 'bearing': 10, 'to': TO})

        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.json(), {'error': 'Routing service unavailable'})
        self.assertNoDebugInfo(response)

    def test_osrm_server_error_is_502(self):
        resp = http({}, status_code=503)
        resp.json.side_effect = ValueError('not json')
        self.get.return_value = resp
        self.assertEqual(self.call('post', NAVIGATE, {'from': FROM, 'to': TO}).status_code, 502)

    def test_invalid_requests_are_400(self):
        too_many = [{'lat': 42.69, 'lng': 23.32}] * 26
        cases = {
            'missing from': {'to': TO},
            'from not object': {'from': [23.3, 42.6], 'to': TO},
            'from missing lng': {'from': {'lat': 42.6}, 'to': TO},
            'from string lat': {'from': {'lat': '42.6', 'lng': 23.3}, 'to': TO},
            'from bool lat': {'from': {'lat': True, 'lng': 23.3}, 'to': TO},
            'missing to': {'from': FROM},
            'to not list': {'from': FROM, 'to': TO[0]},
            'empty to': {'from': FROM, 'to': []},
            'bad to point': {'from': FROM, 'to': [TO[0], {'lat': 42.6}]},
            'too many points': {'from': FROM, 'to': too_many},
            'lat out of range': {'from': {'lat': 91, 'lng': 23.3}, 'to': TO},
            'lng out of range': {'from': FROM, 'to': [{'lat': 42.6, 'lng': 181}]},
            'string bearing': {'from': FROM, 'bearing': 'east', 'to': TO},
            'bool bearing': {'from': FROM, 'bearing': True, 'to': TO},
        }
        for name, body in cases.items():
            with self.subTest(name):
                response = self.call('post', NAVIGATE, body)
                self.assertEqual(response.status_code, 400, response.content)
                self.assertIn('error', response.json())
        self.get.assert_not_called()

    def test_twenty_five_points_are_allowed(self):
        self.get.return_value = http(route_ok(25))
        response = self.call('post', NAVIGATE, {'from': FROM, 'to': [{'lat': 42.69, 'lng': 23.32}] * 25})
        self.assertEqual(response.status_code, 200, response.content)

    def test_manager_gets_403(self):
        self.as_user(self.manager_a)
        self.assertEqual(self.call('post', NAVIGATE, {'from': FROM, 'to': TO}).status_code, 403)
        self.get.assert_not_called()

    def test_anonymous_gets_401(self):
        self.client.force_authenticate(user=None)
        self.assertEqual(self.call('post', NAVIGATE, {'from': FROM, 'to': TO}).status_code, 401)
        self.get.assert_not_called()

    def test_no_database_queries(self):
        self.get.return_value = http(route_ok(2))
        with CaptureQueriesContext(connection) as ctx:
            response = self.call('post', NAVIGATE, {'from': FROM, 'bearing': 87.5, 'to': TO})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(ctx.captured_queries), 0, [q['sql'] for q in ctx.captured_queries])


class OfficeRouteToWarehouseTests(ApiTestBase):
    def setUp(self):
        super().setUp()
        # Exercise the real osrm_trip so the URL can be checked; mock its HTTP call.
        self.osrm.side_effect = real_osrm_trip
        patcher = mock.patch('delivery.routing.requests.get')
        self.get = patcher.start()
        self.addCleanup(patcher.stop)
        self.as_user(self.trucker_a1)
        self.office_a2 = Office.objects.create(
            name='Office A2', address='A2 st', latitude=37.45, longitude=-122.10, company=self.company_a,
        )

    def body(self, **extra):
        return {
            'driver_username': self.trucker_a1.username,
            'current_lat': 37.4, 'current_lng': -122.0,
            'office_ids': [self.office_a.id, self.office_a2.id],
            **extra,
        }

    def trip_response(self, visit_order, roundtrip):
        """OSRM Trip JSON; `visit_order[i]` is the waypoint_index of input i."""
        n = len(visit_order)
        legs = [{'steps': [STEP], 'duration': 60.0 + i, 'distance': 500.0} for i in range(n if roundtrip else n - 1)]
        return {
            'code': 'Ok',
            'trips': [{
                'geometry': {'type': 'LineString', 'coordinates': [[-122.0, 37.4], [-122.05, 37.42], [-122.1, 37.45]]},
                'legs': legs,
                'distance': 9000.0,
                'duration': 900.0,
            }],
            'waypoints': [
                {'waypoint_index': w, 'trips_index': 0, 'location': [0.0, 0.0]} for w in visit_order
            ],
        }

    def offices_in_input_order(self):
        """Office ids in the order the view sends them (its queryset order)."""
        url = self.get.call_args.args[0]
        coords = urlsplit(url).path.split('/')[-1].split(';')
        by_coord = {
            f'{float(o.longitude)},{float(o.latitude)}': o.id
            for o in (self.office_a, self.office_a2)
        }
        return [by_coord[c] for c in coords[1:] if c in by_coord]

    def test_flag_requests_open_trip_ending_at_warehouse(self):
        # Inputs: [current, office x, office y, warehouse]; visit y before x.
        self.get.return_value = http(self.trip_response([0, 2, 1, 3], roundtrip=False))
        response = self.call('post', OFFICE, self.body(return_to_warehouse=True))

        self.assertEqual(response.status_code, 200, response.content)
        url = self.get.call_args.args[0]
        self.assertIn('/trip/v1/', url)
        q = query(url)
        self.assertEqual(q['roundtrip'], ['false'])
        self.assertEqual(q['destination'], ['last'])
        self.assertEqual(q['source'], ['first'])
        self.assertEqual(q['steps'], ['true'])
        coords = urlsplit(url).path.split('/')[-1].split(';')
        self.assertEqual(coords[0], '-122.0,37.4')
        self.assertEqual(coords[-1], f'{float(settings.WAREHOUSE_LONGITUDE)},{float(settings.WAREHOUSE_LATITUDE)}')
        self.assertEqual(len(coords), 4)

        body = response.json()
        self.assertEqual(set(body), {'route_coordinates', 'optimized_offices', 'legs', 'message'})
        input_offices = self.offices_in_input_order()
        self.assertEqual(
            [o['office_id'] for o in body['optimized_offices']],
            [input_offices[1], input_offices[0]],
        )
        self.assertEqual([o['visit_order'] for o in body['optimized_offices']], [1, 2])
        self.assertTrue(all('office_name' in o for o in body['optimized_offices']))
        self.assertEqual(len(body['legs']), 3)  # one per office + warehouse
        self.assertEqual(body['legs'][0]['steps'], [STEP])
        self.assertEqual(body['route_coordinates'], [[-122.0, 37.4], [-122.05, 37.42], [-122.1, 37.45]])

    def test_flag_osrm_failure_is_502(self):
        self.get.return_value = http({'code': 'NoTrips'}, status_code=400)
        response = self.call('post', OFFICE, self.body(return_to_warehouse=True))
        self.assertEqual(response.status_code, 502)

    def test_without_flag_response_is_unchanged(self):
        self.get.return_value = http(self.trip_response([0, 1, 2], roundtrip=True))
        for extra in ({}, {'return_to_warehouse': False}):
            with self.subTest(extra=extra):
                self.get.reset_mock()
                response = self.call('post', OFFICE, self.body(**extra))

                self.assertEqual(response.status_code, 200, response.content)
                url = self.get.call_args.args[0]
                q = query(url)
                self.assertEqual(q['roundtrip'], ['true'])
                self.assertNotIn('destination', q)
                self.assertEqual(len(urlsplit(url).path.split('/')[-1].split(';')), 3)

                input_offices = self.offices_in_input_order()
                office_by_id = {o.id: o for o in (self.office_a, self.office_a2)}
                expected = {
                    'route_coordinates': [[-122.0, 37.4], [-122.05, 37.42], [-122.1, 37.45]],
                    'optimized_offices': [
                        {
                            'office_id': oid,
                            'office_name': office_by_id[oid].name,
                            'address': office_by_id[oid].address,
                            'latitude': float(office_by_id[oid].latitude),
                            'longitude': float(office_by_id[oid].longitude),
                            'visit_order': i,
                        }
                        for i, oid in enumerate(input_offices, start=1)
                    ],
                    'message': 'Office route optimized successfully',
                }
                self.assertEqual(response.json(), expected)

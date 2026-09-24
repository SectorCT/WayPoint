"""Business dates follow settings.TIME_ZONE (Europe/Sofia), and routes from an
earlier day stay visible while they are active."""
import datetime
from datetime import timedelta
from io import StringIO
from unittest import mock

from django.core.management import call_command
from django.db import IntegrityError, transaction
from django.test import override_settings
from django.utils import timezone

from delivery.models import Package, RouteAssignment

from .base import ApiTestBase

# 23:30 UTC on 23 Sep is 02:30 on 24 Sep in Sofia (UTC+3): the window in which
# a UTC "today" disagrees with the users' "today".
LATE_UTC = datetime.datetime(2026, 9, 23, 23, 30, tzinfo=datetime.timezone.utc)
SOFIA_TODAY = datetime.date(2026, 9, 24)


@override_settings(TIME_ZONE='Europe/Sofia')
class LocalTodayTests(ApiTestBase):
    def setUp(self):
        super().setUp()
        patcher = mock.patch('django.utils.timezone.now', return_value=LATE_UTC)
        patcher.start()
        self.addCleanup(patcher.stop)
        self.as_user(self.manager_a)

    def test_localdate_is_the_sofia_date(self):
        self.assertEqual(timezone.localdate(), SOFIA_TODAY)

    def test_today_pending_uses_the_local_date(self):
        due_today = self._make_package(self.company_a, SOFIA_TODAY, 'pending', 'due Sofia today')
        due_tomorrow = self._make_package(self.company_a, SOFIA_TODAY + timedelta(days=1), 'pending', 'due Sofia tomorrow')
        ids = {p['packageID'] for p in self.call('get', 'delivery/packages/today-pending/').json()}
        self.assertIn(due_today.packageID, ids)
        self.assertNotIn(due_tomorrow.packageID, ids)

    def test_seeded_data_matches_today_pending_and_statistics(self):
        Package.objects.all().delete()
        call_command('create_test_data', stdout=StringIO())
        seeded = Package.objects.all()
        self.assertEqual(seeded.filter(deliveryDate=SOFIA_TODAY).count(), 20)
        self.assertEqual(seeded.filter(deliveryDate=SOFIA_TODAY + timedelta(days=1)).count(), 19)

        # The seed command's manager owns the seeded data.
        from django.contrib.auth import get_user_model
        self.as_user(get_user_model().objects.get(username='sarah.chen'))
        today_pending = self.call('get', 'delivery/packages/today-pending/').json()
        stats = self.call('get', 'delivery/statistics/').json()['package_stats']
        self.assertEqual(len(today_pending), 16)  # 20 due today - 4 pre-marked undelivered
        self.assertEqual(stats['pending'], 35)
        self.assertEqual(stats['undelivered'], 4)
        self.assertEqual(stats['pending'] - len(today_pending), 19)  # upcoming = tomorrow's


class StaleRouteTests(ApiTestBase):
    """Rule: any active route counts, whatever its dateOfCreation."""

    def setUp(self):
        super().setUp()
        RouteAssignment.objects.filter(pk=self.route_a1.pk).update(dateOfCreation=self.today - timedelta(days=2))
        self.as_user(self.manager_a)

    def test_stale_active_route_is_on_the_admin_map(self):
        users = {r['user'] for r in self.call('get', 'delivery/route/all/').json()}
        self.assertIn('trucker.a1', users)

    def test_stale_active_route_marks_driver_busy(self):
        response = self.call('post', 'delivery/route/checkDriverStatus/', {'username': 'trucker.a1'})
        self.assertEqual(response.json()['status'], 'active')

    def test_stale_active_route_is_what_the_trucker_sees(self):
        self.as_user(self.trucker_a1)
        response = self.call('post', 'delivery/route/getByDriver/', {'username': 'trucker.a1'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['packageSequence'], self.route_a1.packageSequence)

    def test_finished_routes_do_not_block(self):
        RouteAssignment.objects.filter(pk=self.route_a1.pk).update(isActive=False)
        users = {r['user'] for r in self.call('get', 'delivery/route/all/').json()}
        self.assertNotIn('trucker.a1', users)
        response = self.call('post', 'delivery/route/checkDriverStatus/', {'username': 'trucker.a1'})
        self.assertEqual(response.json()['status'], 'available')

    def test_database_allows_only_one_active_route_per_driver(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            RouteAssignment.objects.create(driver=self.trucker_a1, truck=self.truck_a_spare, packageSequence=[], mapRoute=[])

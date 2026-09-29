from django.conf import settings
from django.core.management.base import BaseCommand
from django.core.management import call_command

from .create_test_data_sofia import SOFIA_WAREHOUSE


class Command(BaseCommand):
    help = 'Like `all`, but with Sofia, Bulgaria test data: runs clear_db, create_test_data_sofia, and assign_manager_to_company SOFIA sofia@abv.bg in order.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Running clear_db...'))
        call_command('clear_db')
        self.stdout.write(self.style.SUCCESS('clear_db completed.'))

        self.stdout.write(self.style.NOTICE('Running create_test_data_sofia...'))
        call_command('create_test_data_sofia')
        self.stdout.write(self.style.SUCCESS('create_test_data_sofia completed.'))

        self.stdout.write(self.style.NOTICE('Assigning manager to company...'))
        call_command('assign_manager_to_company', 'SOFIA', 'sofia@abv.bg')
        self.stdout.write(self.style.SUCCESS('Manager assigned to company.'))

        # Routes start at the WAREHOUSE_* depot; warn if it is still elsewhere.
        if (settings.WAREHOUSE_LATITUDE, settings.WAREHOUSE_LONGITUDE) != (SOFIA_WAREHOUSE['latitude'], SOFIA_WAREHOUSE['longitude']):
            self.stdout.write(self.style.WARNING(
                'The route depot is not the Sofia warehouse. Add these to server/.env and restart the server:\n'
                f"  WAREHOUSE_NAME={SOFIA_WAREHOUSE['name']}\n"
                f"  WAREHOUSE_ADDRESS={SOFIA_WAREHOUSE['address']}\n"
                f"  WAREHOUSE_LATITUDE={SOFIA_WAREHOUSE['latitude']}\n"
                f"  WAREHOUSE_LONGITUDE={SOFIA_WAREHOUSE['longitude']}"
            ))

from django.core.management.base import BaseCommand, CommandError
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Runs clear_db, create_test_data, and assign_manager_to_company COMPANY123 a@a.com in order.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Running clear_db...'))
        call_command('clear_db')
        self.stdout.write(self.style.SUCCESS('clear_db completed.'))

        self.stdout.write(self.style.NOTICE('Running create_test_data...'))
        call_command('create_test_data')
        self.stdout.write(self.style.SUCCESS('create_test_data completed.'))

        self.stdout.write(self.style.NOTICE('Assigning manager to company...'))
        call_command('assign_manager_to_company', 'COMPANY123', 'a@a.com')
        self.stdout.write(self.style.SUCCESS('Manager assigned to company.')) 
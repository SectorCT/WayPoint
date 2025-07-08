from django.core.management.base import BaseCommand, CommandError
from authentication.models import Company, User
from django.db import models

class Command(BaseCommand):
    help = 'Assign a manager user to a company by company unique_id and manager email or username.'

    def add_arguments(self, parser):
        parser.add_argument('company_id', type=str, help='The unique_id of the company')
        parser.add_argument('manager', type=str, help='The email or username of the manager user')

    def handle(self, *args, **options):
        company_id = options['company_id']
        manager_identifier = options['manager']

        try:
            company = Company.objects.get(unique_id=company_id)
        except Company.DoesNotExist:
            raise CommandError(f'Company with unique_id {company_id} does not exist.')

        try:
            manager = User.objects.get(
                models.Q(email=manager_identifier) | models.Q(username=manager_identifier),
                isManager=True
            )
        except User.DoesNotExist:
            raise CommandError(f'Manager with email or username {manager_identifier} does not exist or is not a manager.')

        company.manager = manager
        company.save()
        # Ensure the manager's company field is set
        if manager.company != company:
            manager.company = company
            manager.save()
        self.stdout.write(self.style.SUCCESS(f'Assigned manager {manager.email} to company {company.name} (ID: {company.unique_id})')) 
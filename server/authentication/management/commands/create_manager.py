from django.core.management.base import BaseCommand, CommandError
from authentication.models import Company, User

class Command(BaseCommand):
    help = 'Create a company and a manager user, and assign the manager to the company.'

    def add_arguments(self, parser):
        parser.add_argument('company_id', type=str, help='Unique ID for the company')
        parser.add_argument('company_name', type=str, help='Name of the company')
        parser.add_argument('manager_email', type=str, help='Email for the manager user')
        parser.add_argument('manager_username', type=str, help='Username for the manager user')
        parser.add_argument('manager_password', type=str, help='Password for the manager user')

    def handle(self, *args, **options):
        company_id = options['company_id']
        company_name = options['company_name']
        manager_email = options['manager_email']
        manager_username = options['manager_username']
        manager_password = options['manager_password']

        if Company.objects.filter(unique_id=company_id).exists():
            raise CommandError(f'Company with unique_id {company_id} already exists.')
        if User.objects.filter(email=manager_email).exists():
            raise CommandError(f'User with email {manager_email} already exists.')
        if User.objects.filter(username=manager_username).exists():
            raise CommandError(f'User with username {manager_username} already exists.')

        manager = User.objects.create(
            email=manager_email,
            username=manager_username,
            isManager=True,
            is_staff=True,
            is_active=True,
            verified=True
        )
        manager.set_password(manager_password)
        manager.save()

        company = Company.objects.create(
            unique_id=company_id,
            name=company_name,
            manager=manager
        )
        manager.company = company
        manager.save()

        self.stdout.write(self.style.SUCCESS(f'Created company: {company.name} (ID: {company.unique_id})'))
        self.stdout.write(self.style.SUCCESS(f'Created manager: {manager.email} / {manager_password}')) 
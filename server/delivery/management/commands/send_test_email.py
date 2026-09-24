from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from delivery.email_service import DeliveryEmailService
from delivery.models import Office, Package


class Command(BaseCommand):
    help = (
        'Send the delivery notification emails to an address, to check the email '
        'configuration (EMAIL_* in server/.env). Nothing is saved to the database.'
    )

    def add_arguments(self, parser):
        parser.add_argument('to', help='Recipient address for the test emails')
        parser.add_argument(
            '--office', action='store_true',
            help='Also send the "available for pickup at an office" notification',
        )

    def handle(self, *args, **options):
        self.stdout.write(f'Email backend: {settings.EMAIL_BACKEND}')
        if settings.EMAIL_BACKEND.endswith('console.EmailBackend'):
            self.stdout.write(self.style.WARNING(
                'SMTP is not configured (EMAIL_HOST_USER is empty), so the emails are '
                'printed below instead of being sent.'
            ))

        # An unsaved package is enough to render the templates.
        package = Package(
            packageID='TEST00000000', address='1 Test Street', latitude=0, longitude=0,
            recipient='Test Recipient', recipientPhoneNumber='0000000',
            recipientEmail=options['to'], deliveryDate=timezone.localdate(), weight=1,
        )

        sent = DeliveryEmailService.send_delivery_notification(package, 'test.driver')
        if options['office']:
            office = Office.objects.first()
            sent = DeliveryEmailService.send_office_delivery_notification(
                package,
                office.name if office else 'Test Office',
                'test.driver',
                office.address if office else '1 Office Street',
            ) and sent

        if not sent:
            raise CommandError('Sending failed; see the log output above for the SMTP error.')
        self.stdout.write(self.style.SUCCESS(f'Test email(s) sent to {options["to"]}.'))

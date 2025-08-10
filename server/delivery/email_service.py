from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class DeliveryEmailService:
    @staticmethod
    def send_delivery_notification(package, driver_name=None):
        """
        Send delivery notification email to package recipient
        
        Args:
            package: Package object
            driver_name: Name of the driver who delivered the package
        """
        if not package.recipientEmail:
            logger.warning(f"No email address for package {package.packageID}")
            return False
        
        try:
            # Prepare email context
            context = {
                'package': package,
                'driver_name': driver_name or 'our delivery driver',
                'company_name': 'WayPoint Delivery'  # You can make this configurable
            }
            
            # Render HTML email template
            html_message = render_to_string('delivery/email/delivery_notification.html', context)
            
            # Create plain text version
            plain_message = strip_tags(html_message)
            
            # Send email
            send_mail(
                subject=f'Package {package.packageID} Delivered Successfully',
                message=plain_message,
                html_message=html_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[package.recipientEmail],
                fail_silently=False,
            )
            
            logger.info(f"Delivery notification sent to {package.recipientEmail} for package {package.packageID}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send delivery notification for package {package.packageID}: {str(e)}")
            return False
    
    @staticmethod
    def send_office_delivery_notification(package, office_name, driver_name=None):
        """
        Send notification when package is delivered to office instead of recipient
        
        Args:
            package: Package object
            office_name: Name of the office where package was delivered
            driver_name: Name of the driver
        """
        if not package.recipientEmail:
            logger.warning(f"No email address for package {package.packageID}")
            return False
        
        try:
            context = {
                'package': package,
                'office_name': office_name,
                'driver_name': driver_name or 'our delivery driver',
                'company_name': 'WayPoint Delivery'
            }
            
            html_message = render_to_string('delivery/email/office_delivery_notification.html', context)
            plain_message = strip_tags(html_message)
            
            send_mail(
                subject=f'Package {package.packageID} Available for Pickup at {office_name}',
                message=plain_message,
                html_message=html_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[package.recipientEmail],
                fail_silently=False,
            )
            
            logger.info(f"Office delivery notification sent to {package.recipientEmail} for package {package.packageID}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send office delivery notification for package {package.packageID}: {str(e)}")
            return False

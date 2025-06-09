from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def send_registration_notification(user, company):
    """Send email notifications for new user registration"""
    # Email to the new user
    user_subject = 'Welcome to WayPoint - Registration Successful'
    user_context = {
        'username': user.username,
        'company_name': company.company_name,
        'verification_status': 'pending'
    }
    user_html_message = render_to_string('email/registration_user.html', user_context)
    user_plain_message = strip_tags(user_html_message)
    
    send_mail(
        user_subject,
        user_plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        html_message=user_html_message,
        fail_silently=False,
    )
    
    # Email to the company manager
    manager_subject = f'New User Registration - {user.username}'
    manager_context = {
        'username': user.username,
        'email': user.email,
        'phone': user.phoneNumber,
        'company_name': company.company_name
    }
    manager_html_message = render_to_string('email/registration_manager.html', manager_context)
    manager_plain_message = strip_tags(manager_html_message)
    
    send_mail(
        manager_subject,
        manager_plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [company.manager_email],
        html_message=manager_html_message,
        fail_silently=False,
    )

def send_verification_notification(user):
    """Send email notification when a user is verified"""
    subject = 'WayPoint - Account Verified'
    context = {
        'username': user.username,
        'company_name': user.company.company_name
    }
    html_message = render_to_string('email/verification_notification.html', context)
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        html_message=html_message,
        fail_silently=False,
    ) 
#!/usr/bin/env python
"""
Test script to verify email functionality with direct environment variable setting
"""
import os
import django

# Set email environment variables directly for testing
os.environ['EMAIL_HOST'] = 'smtp.gmail.com'
os.environ['EMAIL_PORT'] = '587'
os.environ['EMAIL_USE_TLS'] = 'True'
os.environ['EMAIL_HOST_USER'] = 'asrr3fl3x@gmail.com'
os.environ['EMAIL_HOST_PASSWORD'] = 'your_app_password_here'  # Replace with your actual app password
os.environ['DEFAULT_FROM_EMAIL'] = 'asrr3fl3x@gmail.com'

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from delivery.email_service import DeliveryEmailService
from delivery.models import Package
from datetime import date

def test_email_service():
    """Test the email service with a dummy package"""
    
    # Create a test package (don't save to database)
    test_package = Package(
        packageID='TEST123',
        address='123 Test Street, Test City',
        latitude=42.692865,
        longitude=23.334036,
        recipient='John Doe',
        recipientPhoneNumber='+1234567890',
        recipientEmail='dimitrovradoslav12@gmail.com',  # Use a real email for testing
        deliveryDate=date.today(),
        weight=2.5,
        status='delivered'
    )
    
    print("Testing email service...")
    print(f"Package: {test_package.packageID}")
    print(f"Recipient: {test_package.recipient}")
    print(f"Email: {test_package.recipientEmail}")
    print(f"From Email: {os.environ.get('DEFAULT_FROM_EMAIL', 'NOT SET')}")
    
    try:
        # Test delivery notification
        result = DeliveryEmailService.send_delivery_notification(test_package, "Test Driver")
        
        if result:
            print("✅ Delivery notification email sent successfully!")
        else:
            print("❌ Failed to send delivery notification email")
            
    except Exception as e:
        print(f"❌ Error sending email: {str(e)}")
        print("Make sure your email settings are configured correctly")
        print("You need to replace 'your_app_password_here' with your actual Gmail app password")

if __name__ == '__main__':
    test_email_service()

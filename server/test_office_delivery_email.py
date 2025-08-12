#!/usr/bin/env python
"""
Test script to verify office delivery email functionality
"""
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from delivery.email_service import DeliveryEmailService
from delivery.models import Package
from datetime import date

def test_office_delivery_email():
    """Test the office delivery email service with a dummy package"""
    
    # Create a test package (don't save to database)
    test_package = Package(
        packageID='TEST123',
        address='123 Test Street, Test City',
        latitude=42.692865,
        longitude=23.334036,
        recipient='John Doe',
        recipientPhoneNumber='+1234567890',
        recipientEmail='dimitrovradoslav12@gmail.com',  # Use your email for testing
        deliveryDate=date.today(),
        weight=2.5,
        status='delivered'
    )
    
    print("Testing office delivery email service...")
    print(f"Package: {test_package.packageID}")
    print(f"Recipient: {test_package.recipient}")
    print(f"Email: {test_package.recipientEmail}")
    
    try:
        # Test office delivery notification
        result = DeliveryEmailService.send_office_delivery_notification(
            test_package, 
            "Main Office", 
            "Test Driver",
            "123 Main Street, Sofia, Bulgaria"
        )
        
        if result:
            print("✅ Office delivery notification email sent successfully!")
        else:
            print("❌ Failed to send office delivery notification email")
            
    except Exception as e:
        print(f"❌ Error sending office delivery email: {str(e)}")
        print("Make sure your email settings are configured correctly in .env")

if __name__ == '__main__':
    test_office_delivery_email()

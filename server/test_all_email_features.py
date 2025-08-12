#!/usr/bin/env python
"""
Comprehensive test script to verify all email functionality
"""
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from delivery.email_service import DeliveryEmailService
from delivery.models import Package
from datetime import date

def test_all_email_features():
    """Test all email features with a dummy package"""
    
    # Create a test package (don't save to database)
    test_package = Package(
        packageID='TEST123',
        address='123 Test Street, Test City',
        latitude=42.692865,
        longitude=23.334036,
        recipient='John Doe',
        recipientPhoneNumber='+1234567890',
        recipientEmail='dimitrovradoslav12@gmail.com',  # Your email for testing
        deliveryDate=date.today(),
        weight=2.5,
        status='delivered'
    )
    
    print("🧪 Testing All Email Features")
    print("=" * 50)
    print(f"Package: {test_package.packageID}")
    print(f"Recipient: {test_package.recipient}")
    print(f"Email: {test_package.recipientEmail}")
    print(f"From Email: {os.environ.get('DEFAULT_FROM_EMAIL', 'NOT SET')}")
    print("=" * 50)
    
    # Test 1: Delivery Notification
    print("\n📧 Test 1: Delivery Notification Email")
    print("-" * 30)
    try:
        result = DeliveryEmailService.send_delivery_notification(test_package, "Test Driver")
        if result:
            print("✅ Delivery notification email sent successfully!")
        else:
            print("❌ Failed to send delivery notification email")
    except Exception as e:
        print(f"❌ Error sending delivery email: {str(e)}")
    
    # Test 2: Office Delivery Notification
    print("\n🏢 Test 2: Office Delivery Notification Email")
    print("-" * 30)
    try:
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
    
    print("\n" + "=" * 50)
    print("🎯 Email Testing Complete!")
    print("\n📋 Next Steps:")
    print("1. Check your email (dimitrovradoslav12@gmail.com) for test emails")
    print("2. Update existing packages with: python update_packages_email.py")
    print("3. Test with real delivery data through the mobile app")

if __name__ == '__main__':
    test_all_email_features()

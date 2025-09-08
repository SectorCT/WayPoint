#!/usr/bin/env python3
"""
Test script to verify truck release functionality when all packages are completed.
This script tests the new automatic truck release feature.
"""

import os
import sys
import django

# Add the server directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from delivery.models import Package, Truck, RouteAssignment, Office
from authentication.models import User
from delivery.package import _check_and_release_truck_if_route_complete
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_test_data():
    """Create test data for the truck release functionality test."""
    
    # Create a test office
    office, created = Office.objects.get_or_create(
        name="Test Office",
        defaults={
            'address': 'Test Address',
            'latitude': 42.6977,
            'longitude': 23.3219
        }
    )
    
    # Create a test truck
    truck, created = Truck.objects.get_or_create(
        licensePlate="TEST123",
        defaults={'kilogramCapacity': 1000.00, 'isUsed': True}
    )
    
    # Create a test user (driver)
    driver, created = User.objects.get_or_create(
        username="test_driver",
        defaults={'email': 'test@example.com'}
    )
    
    # Create test packages
    packages = []
    for i in range(3):
        package, created = Package.objects.get_or_create(
            packageID=f"TEST{i+1:03d}",
            defaults={
                'address': f'Test Address {i+1}',
                'latitude': 42.6977 + (i * 0.01),
                'longitude': 23.3219 + (i * 0.01),
                'recipient': f'Test Recipient {i+1}',
                'recipientPhoneNumber': f'+35988800000{i+1}',
                'deliveryDate': '2024-01-15',
                'weight': 10.00,
                'status': 'in_transit'
            }
        )
        packages.append(package)
    
    # Create a test route assignment
    route, created = RouteAssignment.objects.get_or_create(
        driver=driver,
        defaults={
            'truck': truck,
            'isActive': True,
            'packageSequence': [
                {'packageID': 'TEST001', 'status': 'in_transit'},
                {'packageID': 'TEST002', 'status': 'in_transit'},
                {'packageID': 'TEST003', 'status': 'in_transit'},
                {'packageID': 'ADMIN', 'status': 'pending'}  # Default location
            ]
        }
    )
    
    return truck, driver, packages, route

def test_truck_release_functionality():
    """Test the truck release functionality."""
    
    logger.info("=== Testing Truck Release Functionality ===")
    
    # Create test data
    truck, driver, packages, route = create_test_data()
    
    logger.info(f"Initial state:")
    logger.info(f"  Truck {truck.licensePlate} isUsed: {truck.isUsed}")
    logger.info(f"  Route {route.id} isActive: {route.isActive}")
    logger.info(f"  Packages: {[p.packageID + ':' + p.status for p in packages]}")
    
    # Test 1: Mark first package as delivered
    logger.info("\n--- Test 1: Mark first package as delivered ---")
    packages[0].status = 'delivered'
    packages[0].save()
    
    # Update route sequence
    route.packageSequence[0]['status'] = 'delivered'
    route.save()
    
    # Check truck release
    _check_and_release_truck_if_route_complete(route)
    
    # Refresh from database
    truck.refresh_from_db()
    route.refresh_from_db()
    
    logger.info(f"After marking first package as delivered:")
    logger.info(f"  Truck {truck.licensePlate} isUsed: {truck.isUsed}")
    logger.info(f"  Route {route.id} isActive: {route.isActive}")
    
    # Test 2: Mark second package as undelivered
    logger.info("\n--- Test 2: Mark second package as undelivered ---")
    packages[1].status = 'undelivered'
    packages[1].office = Office.objects.first()
    packages[1].save()
    
    # Update route sequence
    route.packageSequence[1]['status'] = 'undelivered'
    route.save()
    
    # Check truck release
    _check_and_release_truck_if_route_complete(route)
    
    # Refresh from database
    truck.refresh_from_db()
    route.refresh_from_db()
    
    logger.info(f"After marking second package as undelivered:")
    logger.info(f"  Truck {truck.licensePlate} isUsed: {truck.isUsed}")
    logger.info(f"  Route {route.id} isActive: {route.isActive}")
    
    # Test 3: Mark third package as delivered (should release truck)
    logger.info("\n--- Test 3: Mark third package as delivered (should release truck) ---")
    packages[2].status = 'delivered'
    packages[2].save()
    
    # Update route sequence
    route.packageSequence[2]['status'] = 'delivered'
    route.save()
    
    # Check truck release
    _check_and_release_truck_if_route_complete(route)
    
    # Refresh from database
    truck.refresh_from_db()
    route.refresh_from_db()
    
    logger.info(f"After marking third package as delivered:")
    logger.info(f"  Truck {truck.licensePlate} isUsed: {truck.isUsed}")
    logger.info(f"  Route {route.id} isActive: {route.isActive}")
    
    # Verify the truck was released
    if not truck.isUsed and not route.isActive:
        logger.info("✅ SUCCESS: Truck was released when all packages were completed!")
    else:
        logger.error("❌ FAILURE: Truck was not released when all packages were completed!")
        return False
    
    logger.info("\n=== Test completed successfully! ===")
    return True

def cleanup_test_data():
    """Clean up test data."""
    logger.info("Cleaning up test data...")
    
    # Delete test packages
    Package.objects.filter(packageID__startswith='TEST').delete()
    
    # Delete test route assignment
    RouteAssignment.objects.filter(driver__username='test_driver').delete()
    
    # Delete test truck
    Truck.objects.filter(licensePlate='TEST123').delete()
    
    # Delete test user
    User.objects.filter(username='test_driver').delete()
    
    logger.info("Test data cleaned up.")

if __name__ == '__main__':
    try:
        success = test_truck_release_functionality()
        if success:
            print("\n🎉 All tests passed! The truck release functionality is working correctly.")
        else:
            print("\n❌ Tests failed! Please check the implementation.")
            sys.exit(1)
    finally:
        cleanup_test_data()

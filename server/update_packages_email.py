#!/usr/bin/env python
"""
Script to update all existing packages with the email address dimitrovradoslav12@gmail.com
"""
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from delivery.models import Package

def update_packages_email():
    """Update all packages to have the email dimitrovradoslav12@gmail.com"""
    
    # Get all packages
    packages = Package.objects.all()
    print(f"Found {packages.count()} packages to update")
    
    # Update each package with the email
    updated_count = 0
    for package in packages:
        if not package.recipientEmail or package.recipientEmail != 'dimitrovradoslav12@gmail.com':
            package.recipientEmail = 'dimitrovradoslav12@gmail.com'
            package.save()
            updated_count += 1
            print(f"Updated package {package.packageID} for {package.recipient}")
    
    print(f"\n✅ Successfully updated {updated_count} packages with email: dimitrovradoslav12@gmail.com")
    
    # Verify the update
    packages_with_email = Package.objects.filter(recipientEmail='dimitrovradoslav12@gmail.com')
    print(f"Total packages with email: {packages_with_email.count()}")
    
    # Show some examples
    print("\nExample packages:")
    for package in packages_with_email[:5]:
        print(f"- {package.packageID}: {package.recipient} -> {package.recipientEmail}")

if __name__ == '__main__':
    update_packages_email()

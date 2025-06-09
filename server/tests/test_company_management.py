from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from company_management.models import Company
import uuid
import json

User = get_user_model()

class CompanyManagementTest(TestCase):
    def setUp(self):
        # Create admin user (using regular user creation with is_staff=True)
        self.admin = User.objects.create_user(
            email='admin@test.com',
            username='admin',
            phoneNumber='1234567890',
            password='adminpass123',
            isManager=True,
            is_staff=True,
            is_superuser=True
        )
        
        # Create regular user (will be manager)
        self.manager = User.objects.create_user(
            email='manager@test.com',
            username='manager',
            phoneNumber='0987654321',
            password='managerpass123',
            isManager=True
        )

        # Create trucker user
        self.trucker = User.objects.create_user(
            email='trucker@test.com',
            username='trucker',
            phoneNumber='5555555555',
            password='truckerpass123',
            isManager=False
        )

        # Create test company
        self.company = Company.objects.create(
            company_name='Test Company',
            manager_email='manager@test.com'
        )

        # Link manager to company
        self.manager.company_id = self.company.id
        self.manager.is_verified = True
        self.manager.save()

        # Link trucker to company (unverified)
        self.trucker.company_id = self.company.id
        self.trucker.is_verified = False
        self.trucker.save()

        # Setup API client
        self.client = APIClient()

    def test_create_company_admin_only(self):
        """Test that only admin can create companies"""
        # Login as admin
        self.client.force_authenticate(user=self.admin)
        
        # Try to create company
        data = {
            'company_name': 'New Company',
            'manager_email': 'newmanager@test.com',
            'manager_password': 'newpass123',
            'manager_username': 'newmanager',
            'manager_phone': '1111111111'
        }
        response = self.client.post(
            reverse('company-list'),
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Login as manager
        self.client.force_authenticate(user=self.manager)
        
        # Try to create company as manager
        data = {
            'company_name': 'Another Company',
            'manager_email': 'another@test.com',
            'manager_password': 'anotherpass123',
            'manager_username': 'another',
            'manager_phone': '2222222222'
        }
        response = self.client.post(
            reverse('company-list'),
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_companies_admin_only(self):
        """Test that only admin can list companies"""
        # Login as admin
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse('company-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Should see the test company
        
        # Login as manager
        self.client.force_authenticate(user=self.manager)
        response = self.client.get(reverse('company-list'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_verify_trucker(self):
        """Test trucker verification process"""
        # Login as manager
        self.client.force_authenticate(user=self.manager)
        
        # Verify trucker
        data = {'trucker_id': str(self.trucker.id)}  # Convert UUID to string
        response = self.client.post(
            reverse('company-verify-trucker', args=[str(self.company.id)]),  # Convert UUID to string
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check trucker is verified
        self.trucker.refresh_from_db()
        self.assertTrue(self.trucker.is_verified)
        self.assertIsNotNone(self.trucker.verification_date)

    def test_company_truckers_list(self):
        """Test listing company truckers"""
        # Login as manager
        self.client.force_authenticate(user=self.manager)
        
        # Get company truckers
        response = self.client.get(
            reverse('company-truckers', args=[str(self.company.id)])  # Convert UUID to string
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Should see the trucker
        self.assertEqual(response.data[0]['email'], 'trucker@test.com')
        self.assertFalse(response.data[0]['is_verified'])

    def test_company_activation(self):
        """Test company activation/deactivation"""
        # Login as admin
        self.client.force_authenticate(user=self.admin)
        
        # Deactivate company
        response = self.client.post(
            reverse('company-deactivate', args=[str(self.company.id)])  # Convert UUID to string
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.company.refresh_from_db()
        self.assertFalse(self.company.status)
        
        # Activate company
        response = self.client.post(
            reverse('company-activate', args=[str(self.company.id)])  # Convert UUID to string
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.company.refresh_from_db()
        self.assertTrue(self.company.status) 
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db import connection
import uuid

User = get_user_model()

class CompanyUserRelationshipTest(TestCase):
    def setUp(self):
        # Create necessary tables and columns for testing
        with connection.cursor() as cursor:
            # Create companies table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS companies (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    company_name VARCHAR(255) NOT NULL,
                    manager_email VARCHAR(255) NOT NULL UNIQUE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    status BOOLEAN DEFAULT true
                );
                CREATE INDEX IF NOT EXISTS idx_companies_manager_email ON companies(manager_email);
            """)

            # Add company relationship columns to authentication_user table
            cursor.execute("""
                DO $$ 
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                 WHERE table_name='authentication_user' AND column_name='company_id') THEN
                        ALTER TABLE authentication_user 
                        ADD COLUMN company_id UUID REFERENCES companies(id),
                        ADD COLUMN is_verified BOOLEAN DEFAULT false,
                        ADD COLUMN verification_date TIMESTAMP WITH TIME ZONE;
                        
                        CREATE INDEX IF NOT EXISTS idx_authentication_user_company_id 
                        ON authentication_user(company_id);
                    END IF;
                END $$;
            """)

        # Create test data
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO companies (id, company_name, manager_email, status)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            """, [
                uuid.uuid4(),
                'Test Company',
                'manager@testcompany.com',
                True
            ])
            self.company_id = cursor.fetchone()[0]

        self.manager = User.objects.create_user(
            email='manager@testcompany.com',
            username='manager',
            phoneNumber='1234567890',
            isManager=True
        )

        self.trucker = User.objects.create_user(
            email='trucker@testcompany.com',
            username='trucker',
            phoneNumber='0987654321',
            isManager=False
        )

    def test_company_creation(self):
        """Test that company was created correctly"""
        with connection.cursor() as cursor:
            cursor.execute("SELECT company_name, manager_email FROM companies WHERE id = %s", [self.company_id])
            company = cursor.fetchone()
            self.assertEqual(company[0], 'Test Company')
            self.assertEqual(company[1], 'manager@testcompany.com')

    def test_user_company_relationship(self):
        """Test that users can be linked to company"""
        with connection.cursor() as cursor:
            # Link manager to company
            cursor.execute("""
                UPDATE authentication_user 
                SET company_id = %s, is_verified = true 
                WHERE email = %s
            """, [self.company_id, 'manager@testcompany.com'])

            # Link trucker to company (unverified)
            cursor.execute("""
                UPDATE authentication_user 
                SET company_id = %s, is_verified = false 
                WHERE email = %s
            """, [self.company_id, 'trucker@testcompany.com'])

            # Verify manager is linked and verified
            cursor.execute("""
                SELECT company_id, is_verified 
                FROM authentication_user 
                WHERE email = %s
            """, ['manager@testcompany.com'])
            manager_data = cursor.fetchone()
            self.assertEqual(str(manager_data[0]), str(self.company_id))
            self.assertTrue(manager_data[1])

            # Verify trucker is linked but not verified
            cursor.execute("""
                SELECT company_id, is_verified 
                FROM authentication_user 
                WHERE email = %s
            """, ['trucker@testcompany.com'])
            trucker_data = cursor.fetchone()
            self.assertEqual(str(trucker_data[0]), str(self.company_id))
            self.assertFalse(trucker_data[1])

    def test_company_trucker_verification(self):
        """Test that trucker can be verified by manager"""
        with connection.cursor() as cursor:
            # Link trucker to company
            cursor.execute("""
                UPDATE authentication_user 
                SET company_id = %s, is_verified = false 
                WHERE email = %s
            """, [self.company_id, 'trucker@testcompany.com'])

            # Verify the trucker
            cursor.execute("""
                UPDATE authentication_user 
                SET is_verified = true, verification_date = CURRENT_TIMESTAMP 
                WHERE email = %s AND company_id = %s
            """, ['trucker@testcompany.com', self.company_id])

            # Check verification status
            cursor.execute("""
                SELECT is_verified, verification_date 
                FROM authentication_user 
                WHERE email = %s
            """, ['trucker@testcompany.com'])
            verification_data = cursor.fetchone()
            self.assertTrue(verification_data[0])
            self.assertIsNotNone(verification_data[1]) 
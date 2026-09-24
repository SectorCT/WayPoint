"""Authentication endpoint tests. Role/permission coverage for every endpoint,
including `auth/all/` and `auth/getUser/`, lives in
`delivery/tests/test_permissions.py`."""
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

User = get_user_model()


class LoginTests(APITestCase):
    def setUp(self):
        User.objects.create_user(
            email='someone@test.local', username='someone', phoneNumber='5550000',
            password='pw-123456',
        )

    def test_login_returns_tokens_and_user(self):
        response = self.client.post('/v1/auth/login/', {'email': 'someone@test.local', 'password': 'pw-123456'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(set(response.json()), {'access', 'refresh', 'user'})

    def test_wrong_password_is_rejected_without_details(self):
        response = self.client.post('/v1/auth/login/', {'email': 'someone@test.local', 'password': 'nope'}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {'detail': 'Incorrect email or password.'})

    def test_user_list_requires_authentication(self):
        self.assertEqual(self.client.get('/v1/auth/all/').status_code, 401)

    def test_logout_with_garbage_token_does_not_echo_exception(self):
        response = self.client.post('/v1/auth/logout/', {'refresh': 'garbage'}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {'error': 'Invalid or expired refresh token.'})

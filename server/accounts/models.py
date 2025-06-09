from django.contrib.auth.models import AbstractUser
from django.db import models
from company_management.models import Company

class User(AbstractUser):
    phoneNumber = models.CharField(max_length=15, blank=True)
    isManager = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, related_name='users')

    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email'], name='idx_users_email'),
            models.Index(fields=['company'], name='idx_users_company'),
        ]

    def __str__(self):
        return self.email 
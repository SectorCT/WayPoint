from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.conf import settings

class UserManager(BaseUserManager):
    def create_user(self, email, username, phoneNumber, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        
        email = self.normalize_email(email)
        extra_fields.setdefault('isManager', False) 

        user = self.model(email=email, username=username, phoneNumber=phoneNumber, **extra_fields) 
        user.set_password(password)
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    phoneNumber = models.CharField(max_length=15, blank=True, null=True)
    isManager = models.BooleanField(default = False)
    
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'phoneNumber']
    
    objects = UserManager()
    
    company = models.ForeignKey('Company', on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    verified = models.BooleanField(default=False)  # For truckers, managers are always verified
    
    def __str__(self):
        return self.email

class Company(models.Model):
    unique_id = models.CharField(max_length=16, unique=True)  # You can use UUID or a short code
    name = models.CharField(max_length=255)
    manager = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='managed_company')

    def __str__(self):
        return f"{self.name} ({self.unique_id})"

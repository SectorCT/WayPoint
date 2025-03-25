from django.utils import timezone
from django.db import models

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

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

    busy = models.BooleanField(default = False)

    workingHours = models.JSONField(default=dict, blank=True, help_text="Working hours per weekday")
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'phoneNumber']
    
    objects = UserManager()
    
    def __str__(self):
        return self.email

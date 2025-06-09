from django.db import models
import uuid

class Company(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_name = models.CharField(max_length=255)
    manager_email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.BooleanField(default=True)

    class Meta:
        db_table = 'companies'  # Use the existing table name
        indexes = [
            models.Index(fields=['manager_email'], name='idx_companies_manager_email'),
        ]

    def __str__(self):
        return self.company_name 
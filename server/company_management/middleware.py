from django.http import JsonResponse
from django.contrib.auth import get_user_model
from .models import Company
import re

User = get_user_model()

class CompanyIDValidationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip middleware for certain paths
        if request.path in ['/api/auth/login/', '/api/auth/register/']:
            return self.get_response(request)

        # For registration, validate company ID
        if request.path == '/api/auth/register/' and request.method == 'POST':
            company_id = request.data.get('company_id')
            if not company_id:
                return JsonResponse({
                    'detail': 'Company ID is required for registration'
                }, status=400)
            
            try:
                # Validate UUID format
                if not re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', company_id):
                    return JsonResponse({
                        'detail': 'Invalid company ID format'
                    }, status=400)
                
                # Check if company exists and is active
                company = Company.objects.filter(id=company_id, status=True).first()
                if not company:
                    return JsonResponse({
                        'detail': 'Invalid or inactive company ID'
                    }, status=400)
                
            except Exception as e:
                return JsonResponse({
                    'detail': 'Error validating company ID'
                }, status=400)

        return self.get_response(request) 
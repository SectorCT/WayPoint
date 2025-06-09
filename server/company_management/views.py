from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, BasePermission
from .models import Company
from .serializers import CompanySerializer, CompanyCreateSerializer
from django.contrib.auth import get_user_model
from django.utils import timezone
from authentication.utils import send_verification_notification

User = get_user_model()

class IsCompanyManager(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (request.user.isManager and 
                request.user.company == obj and 
                request.user.is_verified)

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'list', 'activate', 'deactivate']:
            return [IsAuthenticated(), IsAdminUser()]
        elif self.action in ['truckers', 'verify_trucker']:
            return [IsAuthenticated(), IsCompanyManager()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return CompanyCreateSerializer
        return CompanySerializer

    @action(detail=True, methods=['get'])
    def truckers(self, request, pk=None):
        """Get all truckers for a company"""
        company = self.get_object()
        truckers = User.objects.filter(
            company=company,
            isManager=False
        ).values('id', 'email', 'username', 'phoneNumber', 'is_verified', 'verification_date')
        
        return Response(truckers)

    @action(detail=True, methods=['post'])
    def verify_trucker(self, request, pk=None):
        """Verify a trucker for the company"""
        company = self.get_object()
        trucker_id = request.data.get('trucker_id')
        
        if not trucker_id:
            return Response({'detail': 'Trucker ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            trucker = User.objects.get(id=trucker_id, company=company, isManager=False)
            trucker.is_verified = True
            trucker.verification_date = timezone.now()
            trucker.save()
            
            # Send verification notification
            send_verification_notification(trucker)
            
            return Response({'detail': 'Trucker verified successfully'})
        except User.DoesNotExist:
            return Response({'detail': 'Trucker not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a company"""
        company = self.get_object()
        company.status = False
        company.save()
        return Response({'detail': 'Company deactivated successfully'})

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a company"""
        company = self.get_object()
        company.status = True
        company.save()
        return Response({'detail': 'Company activated successfully'}) 
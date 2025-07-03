from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import BasePermission, IsAuthenticated
from .models import User
from rest_framework import status
from authentication.models import Company

print('DEBUG: All companies and their manager assignments:')
for c in Company.objects.all():
    print(f'  Company: {c.name} ({c.unique_id}), manager: {c.manager}, manager.company: {getattr(c.manager, "company", None)}, manager.managed_company: {getattr(c.manager, "managed_company", None)}')

print('DEBUG: All managers and their company assignments:')
for u in User.objects.filter(isManager=True):
    print(f'  Manager: {u.email}, company: {u.company}, managed_company: {getattr(u, "managed_company", None)}')

class IsManager(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.isManager)

class ListUnverifiedTruckers(APIView):
    permission_classes = [IsAuthenticated, IsManager]
    def get(self, request):
        print('DEBUG: ListUnverifiedTruckers called')
        print('DEBUG: Headers:', dict(request.headers))
        print('DEBUG: User:', request.user)
        print('DEBUG: User is authenticated:', request.user.is_authenticated)
        print('DEBUG: User isManager:', getattr(request.user, 'isManager', None))
        auth_header = request.headers.get('Authorization', None)
        print('DEBUG: Authorization header:', auth_header)
        if not request.user.is_authenticated:
            print('DEBUG: Permission denied - user not authenticated')
        if not getattr(request.user, 'isManager', None):
            print('DEBUG: Permission denied - user is not manager')
        company = getattr(request.user, 'managed_company', None)
        if not company:
            print('DEBUG: Permission denied - manager does not have a company')
            return Response({'detail': 'Manager does not have a company.'}, status=status.HTTP_400_BAD_REQUEST)
        truckers = User.objects.filter(company=company, isManager=False, verified=False)
        from authentication.serializers import UserSerializer
        serializer = UserSerializer(truckers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class VerifyTrucker(APIView):
    permission_classes = [IsAuthenticated, IsManager]
    def post(self, request):
        print('DEBUG: VerifyTrucker called')
        print('DEBUG: Headers:', dict(request.headers))
        print('DEBUG: User:', request.user)
        print('DEBUG: User is authenticated:', request.user.is_authenticated)
        print('DEBUG: User isManager:', getattr(request.user, 'isManager', None))
        auth_header = request.headers.get('Authorization', None)
        print('DEBUG: Authorization header:', auth_header)
        if not request.user.is_authenticated:
            print('DEBUG: Permission denied - user not authenticated')
        if not getattr(request.user, 'isManager', None):
            print('DEBUG: Permission denied - user is not manager')
        username = request.data.get('username')
        if not username:
            print('DEBUG: Permission denied - username not provided')
            return Response({'detail': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            trucker = User.objects.get(username=username, isManager=False)
        except User.DoesNotExist:
            print('DEBUG: Permission denied - trucker not found')
            return Response({'detail': 'Trucker not found.'}, status=status.HTTP_404_NOT_FOUND)
        if trucker.company != getattr(request.user, 'managed_company', None):
            print('DEBUG: Permission denied - trucker does not belong to manager company')
            return Response({'detail': 'Trucker does not belong to your company.'}, status=status.HTTP_403_FORBIDDEN)
        trucker.verified = True
        trucker.save()
        return Response({'detail': 'Trucker verified successfully.'}, status=status.HTTP_200_OK) 
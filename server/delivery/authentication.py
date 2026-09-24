from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import User
from rest_framework import status
from .permissions import IsManager, get_user_company

class ListUnverifiedTruckers(APIView):
    permission_classes = [IsAuthenticated, IsManager]
    def get(self, request):
        company = get_user_company(request.user)
        if not company:
            return Response({'detail': 'Manager does not have a company.'}, status=status.HTTP_400_BAD_REQUEST)
        truckers = User.objects.filter(company=company, isManager=False, verified=False)
        from authentication.serializers import UserSerializer
        serializer = UserSerializer(truckers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class VerifyTrucker(APIView):
    permission_classes = [IsAuthenticated, IsManager]
    def post(self, request):
        username = request.data.get('username')
        if not username:
            return Response({'detail': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)
        company = get_user_company(request.user)
        try:
            trucker = User.objects.get(username=username, isManager=False)
        except User.DoesNotExist:
            return Response({'detail': 'Trucker not found.'}, status=status.HTTP_404_NOT_FOUND)
        if company is None or trucker.company_id != company.id:
            return Response({'detail': 'Trucker does not belong to your company.'}, status=status.HTTP_403_FORBIDDEN)
        trucker.verified = True
        trucker.save()
        return Response({'detail': 'Trucker verified successfully.'}, status=status.HTTP_200_OK) 
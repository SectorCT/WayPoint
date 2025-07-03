from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.views import APIView    
from rest_framework import status, views
from .models import User
from rest_framework.permissions import BasePermission, IsAuthenticated

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            user_data = UserSerializer(user).data
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': user_data
            }, status=status.HTTP_200_OK)
        
        error_messages = " ".join([" ".join(messages) for messages in serializer.errors.values()])
        return Response({"detail": error_messages}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(views.APIView):
    permission_classes = []
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            user_data = UserSerializer(user).data
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                "user": user_data
            }, status=status.HTTP_200_OK)
        error_messages = " ".join([" ".join(messages) for messages in serializer.errors.values()])
        return Response({"detail": error_messages}, status=status.HTTP_400_BAD_REQUEST)
    

class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token is None:
                return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"detail": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class getAllUsers(APIView):
    def get(self, request):
        users = User.objects.all()
        
        serializer = UserSerializer(users, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class getUser(APIView):
    def post(self, request):
        user = User.objects.get(username = request.data.get("username"))
        return Response({
            'email': user.email,
            'username': user.username,
            'phoneNumber': user.phoneNumber,
            'isManager': user.isManager
        })

class IsManager(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.isManager)

class ListUnverifiedTruckers(APIView):
    permission_classes = [IsAuthenticated, IsManager]
    def get(self, request):
        # Only show truckers in the manager's company
        company = getattr(request.user, 'managed_company', None)
        if not company:
            return Response({'detail': 'Manager does not have a company.'}, status=status.HTTP_400_BAD_REQUEST)
        truckers = User.objects.filter(company=company, isManager=False, verified=False)
        serializer = UserSerializer(truckers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class VerifyTrucker(APIView):
    permission_classes = [IsAuthenticated, IsManager]
    def post(self, request):
        username = request.data.get('username')
        if not username:
            return Response({'detail': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            trucker = User.objects.get(username=username, isManager=False)
        except User.DoesNotExist:
            return Response({'detail': 'Trucker not found.'}, status=status.HTTP_404_NOT_FOUND)
        # Only allow verifying truckers in the manager's company
        if trucker.company != getattr(request.user, 'managed_company', None):
            return Response({'detail': 'Trucker does not belong to your company.'}, status=status.HTTP_403_FORBIDDEN)
        trucker.verified = True
        trucker.save()
        return Response({'detail': 'Trucker verified successfully.'}, status=status.HTTP_200_OK)
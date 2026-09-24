from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.views import APIView    
from rest_framework import status, views
from .models import User
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.exceptions import TokenError
from delivery.permissions import IsManager, get_user_company

class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

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
    permission_classes = [AllowAny]
    authentication_classes = []
    
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
    # The client logs out without an access token; the refresh token in the
    # body is the credential being revoked.
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if refresh_token is None:
            return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response({"error": "Invalid or expired refresh token."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT)

class getAllUsers(APIView):
    """Members of the requesting manager's company."""
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
        company = get_user_company(request.user)
        users = User.objects.filter(company=company) if company else User.objects.none()
        
        serializer = UserSerializer(users, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class getUser(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def post(self, request):
        company = get_user_company(request.user)
        try:
            if company is None:
                raise User.DoesNotExist
            user = User.objects.get(username=request.data.get("username"), company=company)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({
            'email': user.email,
            'username': user.username,
            'phoneNumber': user.phoneNumber,
            'isManager': user.isManager
        })

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from .permissions import IsManager
from rest_framework.response import Response
from rest_framework.views import APIView    
from rest_framework import status, views
from datetime import datetime
from .models import User

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            userData = UserSerializer(user).data
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': userData
            }, status=status.HTTP_200_OK)
        
        errorMessages = " ".join([" ".join(messages) for messages in serializer.errors.values()])
        return Response({"detail": errorMessages}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(views.APIView):
    permission_classes = []
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            userData = UserSerializer(user).data
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': userData
            }, status=status.HTTP_200_OK)
        
        errorMessages = " ".join([" ".join(messages) for messages in serializer.errors.values()])
        return Response({"detail": errorMessages}, status=status.HTTP_400_BAD_REQUEST)
    

class LogoutView(APIView):
    def post(self, request):
        try:
            refreshToken = request.data.get("refresh")
            if refreshToken is None:
                return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refreshToken)
            token.blacklist()

            return Response({"detail": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GetAllUsersView(APIView):
    def get(self, request):
        users = User.objects.all()        
        serializer = UserSerializer(users, many=True)        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class GetAllWorkingDriversView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsManager]
    def get(self, request):
        now = datetime.now()

        # Get weekday as lowercase string like 'monday'
        currentDay = now.strftime('%A').lower()

        availableTodayQs = User.objects.filter(
            driverProfile__workingHours__has_key=currentDay
        )

        on_shift_drivers = []

        for user in availableTodayQs:
            hours = user.driverProfile.workingHours.get(currentDay)
            start = datetime.strptime(hours['start'], '%H:%M').time()
            end = datetime.strptime(hours['end'], '%H:%M').time()

            if start <= now <= end:
                on_shift_drivers.append(user)
    
class GetUserView(APIView):
    def post(self, request):
        user = User.objects.get(username=request.data.get("username"))
        return Response({
            'email': user.email,
            'username': user.username,
            'phoneNumber': user.phoneNumber,
            'isManager': user.isManager
        })
    
class RefreshAccessTokenView(TokenRefreshView):
    serializer_class = TokenRefreshSerializer

class UpdateWorkingHoursView(APIView):
    def post(self, request):
        weekday = request.data.get("day", "").lower()
        start = request.data.get("start")
        end = request.data.get("end")

        if weekday not in ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]:
            return Response({"error": "Invalid weekday."}, status=status.HTTP_400_BAD_REQUEST)

        if not start or not end:
            return Response({"error": "Both start and end times are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            profile = User.objects.get(username = request.data.get('username'))
        except:
            return Response({"error": "User has no driver profile."}, status=status.HTTP_404_NOT_FOUND)
        
        profile.workingHours = profile.workingHours or {}
        profile.workingHours[weekday] = {"start": start, "end": end}
        profile.save()

        return Response({"detail": f"Working hours updated for {weekday}."}, status=status.HTTP_200_OK)
from django.urls import path
from .views import RegisterView, LoginView, LogoutView, getAllUsers, getUser, ListUnverifiedTruckers, VerifyTrucker
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('all/', getAllUsers.as_view(), name = 'get-all-users'),
    path('getUser/', getUser.as_view(), name = 'getUser'),
    path('list-unverified-truckers/', ListUnverifiedTruckers.as_view(), name='list-unverified-truckers'),
    path('verify-trucker/', VerifyTrucker.as_view(), name='verify-trucker'),
]

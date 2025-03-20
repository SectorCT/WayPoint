from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import TruckSerializer
from .permissions import IsManager
from rest_framework import status
from .models import Truck

class createTruck(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsManager]
    def post(self, request):
        serializer = TruckSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Package created successfully."}, status=status.HTTP_201_CREATED)

class getAllTrucks(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsManager]
    def get(self, request):
        trucks = Truck.objects.all()
        serializer = TruckSerializer(trucks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class deleteTruck(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsManager]
    def get(self, id):
        try:
            truck = Truck.objects.get(id=id)
            truck.delete()
            return Response({"detail": f"Package with ID {id} deleted."}, status=status.HTTP_200_OK)
        except Truck.DoesNotExist:
            return Response({"detail": f"Package with ID {id} not found."}, status=404)
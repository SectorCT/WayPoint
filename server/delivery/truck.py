from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import TruckSerializer
from .permissions import IsManager
from rest_framework import status
from .models import Truck

class createTruck(APIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated, IsManager]
    
    def post(self, request, *args, **kwargs):
        serializer = TruckSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Truck created successfully."}, status=status.HTTP_201_CREATED)
        
        error_messages = " ".join([" ".join(messages) for messages in serializer.errors.values()])
        return Response({"detail": error_messages}, status=status.HTTP_400_BAD_REQUEST)

class getAllTrucks(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsManager]
    
    def get(self, request, *args, **kwargs):
        trucks = Truck.objects.all()
        serializer = TruckSerializer(trucks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class deleteTruck(APIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated, IsManager]
    
    def delete(self, request, licensePlate, *args, **kwargs):
        try:
            truck = Truck.objects.get(licensePlate=licensePlate)
            truck.delete()
            return Response({"detail": f"Truck with ID {licensePlate} deleted."}, status=status.HTTP_200_OK)
        except Truck.DoesNotExist:
            return Response({"detail": f"Truck with ID {licensePlate} not found."}, status=status.HTTP_404_NOT_FOUND)

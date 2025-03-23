from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from ..serializers import TruckSerializer
from ..permissions import IsManager
from ..models import Truck

class CreateTruckView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsManager]
    
    def post(self, request, *args, **kwargs):
        serializer = TruckSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Truck created successfully."}, status=status.HTTP_201_CREATED)
        
        errorMessages = " ".join([" ".join(messages) for messages in serializer.errors.values()])
        return Response({"detail": errorMessages}, status=status.HTTP_400_BAD_REQUEST)

class GetAllTrucksView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsManager]
    
    def get(self, request, *args, **kwargs):
        trucks = Truck.objects.all()
        serializer = TruckSerializer(trucks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class DeleteTruckView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsManager]
    
    def delete(self, request, licensePlate, *args, **kwargs):
        try:
            truck = Truck.objects.get(licensePlate=licensePlate)
            truck.delete()
            return Response({"detail": f"Truck with license plate {licensePlate} deleted."}, status=status.HTTP_200_OK)
        except Truck.DoesNotExist:
            return Response({"detail": f"Truck with license plate {licensePlate} not found."}, status=status.HTTP_404_NOT_FOUND)

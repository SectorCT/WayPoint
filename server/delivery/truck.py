import logging

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Truck
from .permissions import IsManager, get_user_company
from .serializers import TruckSerializer

logger = logging.getLogger(__name__)


class createTruck(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def post(self, request, *args, **kwargs):
        company = get_user_company(request.user)
        if company is None:
            return Response({"detail": "Manager does not have a company."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = TruckSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save(company=company)
                return Response({"detail": "Truck created successfully."}, status=status.HTTP_201_CREATED)
            except Exception:
                logger.exception("Truck creation error")
                return Response({"detail": "Could not create truck."}, status=status.HTTP_400_BAD_REQUEST)
        error_messages = " ".join([" ".join(messages) for messages in serializer.errors.values()])
        return Response({"detail": error_messages}, status=status.HTTP_400_BAD_REQUEST)


class getAllTrucks(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request, *args, **kwargs):
        trucks = Truck.objects.for_company(get_user_company(request.user))
        serializer = TruckSerializer(trucks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class getAvailableTrucks(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request, *args, **kwargs):
        trucks = Truck.objects.for_company(get_user_company(request.user)).filter(isUsed=False)
        serializer = TruckSerializer(trucks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class deleteTruck(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def delete(self, request, licensePlate, *args, **kwargs):
        try:
            truck = Truck.objects.for_company(get_user_company(request.user)).get(licensePlate=licensePlate)
            truck.delete()
            return Response({"detail": f"Truck with ID {licensePlate} deleted."}, status=status.HTTP_200_OK)
        except Truck.DoesNotExist:
            return Response({"detail": f"Truck with ID {licensePlate} not found."}, status=status.HTTP_404_NOT_FOUND)

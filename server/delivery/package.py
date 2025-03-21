from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Package, Truck
from .serializers import PackageSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .permissions import IsManager
from datetime import timedelta
from django.utils import timezone

class createPackage(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsManager]

    def post(self, request):
        serializer = PackageSerializer(data=request.data)
        if serializer.is_valid():
            package = serializer.save()
            return Response({"detail": "Package created successfully.", "package": serializer.data}, status=status.HTTP_201_CREATED)

        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class bulkCreatePackages(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsManager]

    def post(self, request):
        packages_data = request.data.get('packages', [])
        if not isinstance(packages_data, list):
            return Response({"detail": "Invalid data format. Expecting a list of packages."}, status=status.HTTP_400_BAD_REQUEST)

        created_packages = []
        errors = []

        for idx, package_data in enumerate(packages_data):
            serializer = PackageSerializer(data=package_data)
            if serializer.is_valid():
                package = serializer.save()
                created_packages.append(serializer.data)
            else:
                errors.append({"index": idx, "errors": serializer.errors})

        response = {
            "created_packages": created_packages,
            "errors": errors,
        }

        status_code = status.HTTP_207_MULTI_STATUS if errors else status.HTTP_201_CREATED
        return Response(response, status=status_code)

class getAllPackages(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
        packages = Package.objects.all()
        serializer = PackageSerializer(packages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class deletePackage(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsManager]

    def delete(self, request, id):
        try:
            package = Package.objects.get(packageID=id)
            package.delete()
            return Response({"detail": f"Package with ID {id} deleted."}, status=status.HTTP_200_OK)
        except ValueError:
            return Response({"detail": "Invalid package ID format."}, status=status.HTTP_400_BAD_REQUEST)
        except Package.DoesNotExist:
            return Response({"detail": f"Package with ID {id} not found."}, status=status.HTTP_404_NOT_FOUND)

def get_packages_for_delivery(drivers):
    drivers_count = len(drivers)

    trucks_count = Truck.objects.count()

    today = timezone.now().date()
    tomorrow = today + timedelta(days=1)

    delivers_count = min(drivers_count, trucks_count)

    max_packages = delivers_count * 10
    packages_qs = Package.objects.filter(deliveryDate__in=[today, tomorrow])[:max_packages]


    packages_data = []
    for pkg in packages_qs:
        packages_data.append({
            "packageID": pkg.packageID,
            "address": pkg.address,
            "latitude": float(pkg.latitude),
            "longitude": float(pkg.longitude),
            "recipient": pkg.recipient,
            "recipientPhoneNumber": pkg.recipientPhoneNumber,
            "deliveryDate": pkg.deliveryDate.isoformat(),
            "weight": float(pkg.weight),
            "status": pkg.status
        })

    data = {
        "packages": packages_data,
        "drivers": drivers
    }

    return data

class MarkAsDelivered(APIView):
    def post(self, request):
        package_id = request.data.get('packageID')
        if not package_id:
            return Response({"error": "packageID not provided"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            package = Package.objects.get(packageID=package_id)
        except Package.DoesNotExist:
            return Response({"error": "Package not found"}, status=status.HTTP_404_NOT_FOUND)
        
        package.status = 'delivered'
        package.save()
        return Response({"detail": "Package marked as delivered"}, status=status.HTTP_200_OK)
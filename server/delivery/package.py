from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Package, RouteAssignment
from .serializers import PackageSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .permissions import IsManager
from rest_framework.decorators import api_view

class createPackage(APIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated, IsManager]

    def post(self, request):
        serializer = PackageSerializer(data=request.data)
        if serializer.is_valid():
            package = serializer.save()
            return Response({"detail": "Package created successfully.", "package": serializer.data}, status=status.HTTP_201_CREATED)

        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class createManyPackages(APIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated, IsManager]


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
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated, IsManager]

    def delete(self, request, id):
        try:
            package = Package.objects.get(packageID=id)
            package.delete()
            return Response({"detail": f"Package with ID {id} deleted."}, status=status.HTTP_200_OK)
        except ValueError:
            return Response({"detail": "Invalid package ID format."}, status=status.HTTP_400_BAD_REQUEST)
        except Package.DoesNotExist:
            return Response({"detail": f"Package with ID {id} not found."}, status=status.HTTP_404_NOT_FOUND)

class MarkAsDelivsered(APIView):
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
    

@api_view(['POST'])
def mark_delivered(request):
    package_id = request.data.get('packageID')
    signature = request.data.get('signature')  # base64 string
    if not package_id:
        return Response({"error": "packageID not provided"}, status=400)
    try:
        package = Package.objects.get(packageID=package_id)
    except Package.DoesNotExist:
        return Response({"error": "Package not found"}, status=404)
    if package.status == 'delivered':
        return Response({"error": "Package already delivered"}, status=400)
    package.status = 'delivered'
    if signature:
        package.signature = signature
    package.save()
    # Намираме всички активни route assignments, в които се съдържа тази пратка,
    # и актуализираме статуса ѝ в packageSequence
    route_assignments = RouteAssignment.objects.filter(isActive=True)
    for route in route_assignments:
        updated = False
        sequence = route.packageSequence  # Списък от речници
        for item in sequence:
            if item.get('packageID') == package_id:
                item['status'] = 'delivered'
                updated = True
        if updated:
            route.packageSequence = sequence
            route.save()
    return Response({"detail": "Package marked as delivered"}, status=200)

@api_view(['POST'])
def mark_undelivered(request):
    package_id = request.data.get('packageID')
    if not package_id:
        return Response({"error": "packageID not provided"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        package = Package.objects.get(packageID=package_id)
    except Package.DoesNotExist:
        return Response({"error": "Package not found"}, status=status.HTTP_404_NOT_FOUND)
    
    if package.status == 'undelivered':
        return Response({"error": "Package already marked as undelivered"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Mark package as undelivered
    package.status = 'undelivered'
    package.save()

    # Update status in all active route assignments
    route_assignments = RouteAssignment.objects.filter(isActive=True)
    for route in route_assignments:
        updated = False
        sequence = route.packageSequence
        for item in sequence:
            if item.get('packageID') == package_id:
                item['status'] = 'undelivered'
                updated = True
        if updated:
            route.packageSequence = sequence
            route.save()

    return Response({"detail": "Package marked as undelivered"}, status=status.HTTP_200_OK)
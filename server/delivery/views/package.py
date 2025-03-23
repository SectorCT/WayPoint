from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import api_view

from ..models import Package, RouteAssignment
from ..serializers import PackageSerializer
from ..permissions import IsManager


class CreatePackageView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsManager]

    def post(self, request):
        serializer = PackageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "detail": "Package created successfully.",
                "package": serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class CreateManyPackagesView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsManager]

    def post(self, request):
        packagesData = request.data.get('packages', [])
        if not isinstance(packagesData, list):
            return Response({
                "detail": "Invalid data format. Expecting a list of packages."
            }, status=status.HTTP_400_BAD_REQUEST)

        createdPackages = []
        errors = []

        for idx, packageData in enumerate(packagesData):
            serializer = PackageSerializer(data=packageData)
            if serializer.is_valid():
                serializer.save()
                createdPackages.append(serializer.data)
            else:
                errors.append({"index": idx, "errors": serializer.errors})

        response = {
            "createdPackages": createdPackages,
            "errors": errors
        }

        statusCode = status.HTTP_207_MULTI_STATUS if errors else status.HTTP_201_CREATED
        return Response(response, status=statusCode)


class GetAllPackagesView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
        packages = Package.objects.all()
        serializer = PackageSerializer(packages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DeletePackageView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsManager]

    def delete(self, request, id):
        try:
            package = Package.objects.get(packageID=id)
            package.delete()
            return Response({
                "detail": f"Package with ID {id} deleted."
            }, status=status.HTTP_200_OK)
        except ValueError:
            return Response({
                "detail": "Invalid package ID format."
            }, status=status.HTTP_400_BAD_REQUEST)
        except Package.DoesNotExist:
            return Response({
                "detail": f"Package with ID {id} not found."
            }, status=status.HTTP_404_NOT_FOUND)


class MarkAsDeliveredView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        packageID = request.data.get('packageID')
        if not packageID:
            return Response({"error": "packageID not provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            package = Package.objects.get(packageID=packageID)
        except Package.DoesNotExist:
            return Response({"error": "Package not found"}, status=status.HTTP_404_NOT_FOUND)

        if package.status == 'delivered':
            return Response({"error": "Package already delivered"}, status=status.HTTP_400_BAD_REQUEST)

        package.status = 'delivered'
        package.save()

        routeAssignments = RouteAssignment.objects.filter(isActive=True)
        for route in routeAssignments:
            updated = False
            sequence = route.packageSequence  # list of dicts
            for item in sequence:
                if item.get('packageID') == packageID:
                    item['status'] = 'delivered'
                    updated = True
            if updated:
                route.packageSequence = sequence
                route.save()

        return Response({"detail": "Package marked as delivered"}, status=status.HTTP_200_OK)

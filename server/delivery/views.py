from rest_framework.views import APIView   
from rest_framework.response import Response
from .serializer import PackageSerializer
from rest_framework import status
from .models import Package
from django.http import JsonResponse

class createPackage(APIView):
    def post(self, request):
        serializer = PackageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Package created successfully."}, status=status.HTTP_201_CREATED)

        error_messages = " ".join([" ".join(messages) for messages in serializer.errors.values()])
        return Response({"detail": error_messages}, status=status.HTTP_400_BAD_REQUEST)

class bulkCreatePackages(APIView):
    def post(self, request):
        packages_data = request.data.get('packages', [])
        if not isinstance(packages_data, list):
            return Response({"detail": "Invalid data format. Expecting a list of packages."}, status=status.HTTP_400_BAD_REQUEST)

        created_packages = []
        errors = []

        for idx, package_data in enumerate(packages_data):
            serializer = PackageSerializer(data=package_data)
            if serializer.is_valid():
                serializer.save()
                created_packages.append(serializer.data)
            else:
                error_messages = " ".join([" ".join(messages) for messages in serializer.errors.values()])
                errors.append({"index": idx, "errors": error_messages})

        response = {
            "created_packages": created_packages,
            "errors": errors,
        }

        status_code = status.HTTP_207_MULTI_STATUS if errors else status.HTTP_201_CREATED
        return Response(response, status=status_code)
    
class getAllPackages(APIView):
    def get(self, request):
        packages = Package.objects.all()
        serializer = PackageSerializer(packages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class deletePackage(APIView):
    def delete(self, request, id):
        try:
            package = Package.objects.get(id=id)
            package.delete()
            return Response({"detail": f"Package with ID {id} deleted."}, status=status.HTTP_200_OK)
        except Package.DoesNotExist:
            return JsonResponse({"detail": f"Package with ID {id} not found."}, status=404)
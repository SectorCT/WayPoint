from rest_framework.views import APIView   
from rest_framework.response import Response
from .serializer import PackageSerializer
from rest_framework import status

class createPackage(APIView):
    def post(self, request):
        serializer = PackageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Package created successfully."}, status=status.HTTP_201_CREATED)

        error_messages = " ".join([" ".join(messages) for messages in serializer.errors.values()])
        return Response({"detail": error_messages}, status=status.HTTP_400_BAD_REQUEST)

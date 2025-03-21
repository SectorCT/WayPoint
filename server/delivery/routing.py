from rest_framework.views import APIView
from rest_framework.response import Response
from .partition import cluster_locations
from .createRoutes import create_routes
from .package import get_packages_for_delivery

class RoutePlannerView(APIView):
    def post(self, request, *args, **kwargs):
        drivers = request.data.get('drivers')
        input_data = get_packages_for_delivery(drivers)
        
        clustered_data = cluster_locations(
            packages_data=input_data["packages"],
            driverUsernames=input_data["drivers"]
        )

        final_routes = create_routes(clustered_data)

        return Response(final_routes)
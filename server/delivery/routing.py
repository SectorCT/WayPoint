from rest_framework.views import APIView
from rest_framework.response import Response
from .clusterLocations import cluster_locations
from .createRoutes import create_routes
from .models import Package, Truck, RouteAssignment
from datetime import timedelta
from django.utils import timezone
from rest_framework import status
from .models import RouteAssignment
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .permissions import IsManager
import json


User = get_user_model()

def create_routes_from_json(json_data):
    """
    Given parsed JSON data (or a JSON string) that contains route information,
    this function creates a RouteAssignment instance for each route object.
    
    Expected JSON format:
    [
        {
            "zone": 0,
            "driverUsername": "driver_1",
            "route": [
                {
                    "waypoint_index": 0,
                    "package_info": {
                        "packageID": "2258ec638a67d6fa712151ff",
                        "address": "...",
                        "latitude": 42.123,
                        "longitude": 23.456,
                        ...
                    },
                    "route": [[23.301454, 42.725443]],
                    ...
                },
                ...
            ]
        },
        {
            "zone": 1,
            "driverUsername": "driver_2",
            "route": [...]
        }
    ]
    """
    # If the provided json_data is a string, parse it into a Python list
    if isinstance(json_data, str):
        data = json.loads(json_data)
    else:
        data = json_data

    created_routes = []
    
    for route_obj in data:
        zone = route_obj.get("zone")
        driver_username = route_obj.get("driverUsername")
        waypoints = route_obj.get("route", [])
        
        try:
            driver = User.objects.get(username=driver_username)
        except User.DoesNotExist:
            # Return a Response with a dict to indicate the error
            return Response({"detail": f"Driver '{driver_username}' does not exist."}, status=400)
        
        # Sort the waypoints by 'waypoint_index' to ensure correct order
        sorted_waypoints = sorted(waypoints, key=lambda w: w.get("waypoint_index", 0))
        
        # Instead of just storing packageID, we'll store the entire package info
        package_sequence = []
        map_route = []
        
        for wp in sorted_waypoints:
            pkg_info = wp.get("package_info", {})
            # If you want to ensure certain keys exist, do validation here
            if pkg_info:
                # Append the entire package info dict
                package_sequence.append(pkg_info)

            # Add the coordinates from the "route" key (if present) into mapRoute
            wp_route = wp.get("route", [])
            if isinstance(wp_route, list):
                # Extend map_route with all coordinate pairs in wp_route
                map_route.extend(wp_route)
        
        # Create the RouteAssignment instance with the full package info
        route_instance = RouteAssignment.objects.create(
            driver=driver,
            packageSequence=package_sequence,
            mapRoute=map_route
        )
        created_routes.append(route_instance)
    
    return created_routes


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
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsManager]
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

class RoutePlannerView(APIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated, IsManager]
    def post(self, request, *args, **kwargs):
        drivers = request.data.get('drivers')
        input_data = get_packages_for_delivery(drivers)
        
        clustered_data = cluster_locations(
            packages_data=input_data["packages"],
            driverUsernames=input_data["drivers"]
        )

        final_routes = create_routes(clustered_data)

        create_routes_from_json(final_routes)

        return Response(final_routes)
    
class getRoutingBasedOnDriver(APIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated, IsManager]

    def post(self, request):
        try:
            driver = User.objects.get(username=request.data['username'])
        except User.DoesNotExist:
            return Response({"error": "Driver not found"}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            route = RouteAssignment.objects.get(driver=driver)
        except RouteAssignment.DoesNotExist:
            return Response({"error": "No route assignment found for this driver"}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            "driver": driver.username,
            "packageSequence": route.packageSequence,
            "mapRoute": route.mapRoute
        }, status=status.HTTP_200_OK)
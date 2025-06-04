FACTORY_ADDRESS = {
    "address": "123 Factory Street, City, Country",
    "latitude": 42.6666,
    "longitude": 23.3750,
    "package_info": {
        "address": "123 Factory Street, City, Country",
        "latitude": 42.6666,
        "longitude": 23.3750,
        "packageID": "ADMIN",
        "recipient": "Factory",
        "recipientPhoneNumber": "",
        "deliveryDate": "2025-03-21",
        "weight": 0,
        "status": "factory"
    }
}

from .serializers import RouteAssignmentSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from .clusterLocations import cluster_locations
from .createRoutes import create_routes, _get_trip_service
from .models import Package, Truck, RouteAssignment
from datetime import timedelta
from django.utils import timezone
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .permissions import IsManager
import json
from django.db.models import Case, When, IntegerField

User = get_user_model()

def create_routes_from_json(json_data):
    """
    Given parsed JSON data (or a JSON string) that contains route information,
    create a RouteAssignment instance for each route object.
    """
    if isinstance(json_data, str):
        data = json.loads(json_data)
    else:
        data = json_data

    created_routes = []
    for route_obj in data:
        driver_username = route_obj.get("driverUsername")
        truck_license_plate = route_obj.get("truckLicensePlate")
        if not truck_license_plate:
            raise ValueError("Truck license plate is required in the JSON data.")

        waypoints = route_obj.get("route", [])

        try:
            driver = User.objects.get(username=driver_username)
        except User.DoesNotExist:
            raise ValueError(f"Driver '{driver_username}' does not exist.")

        try:
            truck = Truck.objects.get(licensePlate=truck_license_plate)
        except Truck.DoesNotExist:
            raise ValueError(f"Truck with license plate '{truck_license_plate}' does not exist.")

        sorted_waypoints = sorted(waypoints, key=lambda w: w.get("waypoint_index", 0))

        package_sequence = []
        map_route = []
        for wp in sorted_waypoints:
            pkg_info = wp.get("package_info")
            if pkg_info:
                package_sequence.append(pkg_info)
            wp_route = wp.get("route", [])
            if isinstance(wp_route, list):
                map_route.extend(wp_route)

        route_instance = RouteAssignment.objects.create_route(
            driver=driver,
            packageSequence=package_sequence,
            mapRoute=map_route,
            truck=truck,
            dateOfCreation=timezone.now().date()
        )
        created_routes.append(route_instance)

    return created_routes


def update_clustered_data_with_truck_and_driver(clustered_data, drivers):
    updated_zones = []
    available_trucks = list(Truck.objects.all().order_by('kilogramCapacity'))
    
    for zone_data in clustered_data:
        if isinstance(zone_data, dict):
            packages = zone_data.get("packages")
            if not packages:
                packages = zone_data.get("locations", [])
        elif isinstance(zone_data, list):
            packages = zone_data
        else:
            continue

        valid_packages = [pkg for pkg in packages if isinstance(pkg, dict)]
        total_weight = sum(pkg.get("weight", 0) for pkg in valid_packages)

        truck_assigned = None
        for truck in available_trucks:
            if truck.kilogramCapacity >= total_weight:
                truck_assigned = truck.licensePlate
                available_trucks.remove(truck)
                break

        driver_username = zone_data.get("driverUsername")
        if not driver_username and drivers:
            driver_username = drivers.pop(0)

        updated_zone = {
            "zone": zone_data.get("zone"),
            "packages": valid_packages,
            "totalWeight": total_weight,
            "truckLicensePlate": truck_assigned,
            "driverUsername": driver_username,
        }
        updated_zones.append(updated_zone)
    return updated_zones


def connect_routes_and_assignments(clustered_data):
    """
    Transforms the clustered zone data into a format suitable for routing,
    now including the factory address as the first (starting) location for each zone.
    """
    zones_for_routing = []
    for zone_data in clustered_data:
        if not isinstance(zone_data, dict):
            continue
        zone_key = zone_data.get("zone")
        locations = []
        for pkg in zone_data.get("packages", []):
            loc = {
                "address": pkg.get("address", ""),
                "latitude": pkg.get("latitude"),
                "longitude": pkg.get("longitude"),
                "package_info": pkg
            }
            locations.append(loc)
        
        # Prepend the factory address to ensure OSRM has a starting point.
        locations = [FACTORY_ADDRESS] + locations
        
        zone_dict = {
            "zone": zone_key,
            "driverUsername": zone_data.get("driverUsername"),
            "truckLicensePlate": zone_data.get("truckLicensePlate"),
            "locations": locations
        }
        zones_for_routing.append(zone_dict)
    
    osrm_routes = create_routes(zones_for_routing)
    
    truck_lookup = {zone["zone"]: zone.get("truckLicensePlate") for zone in zones_for_routing}
    final_routes = []
    for route in osrm_routes:
        zone_key = route.get("zone")
        route["truckLicensePlate"] = truck_lookup.get(zone_key)
        final_routes.append(route)
    
    return final_routes

class RoutePlannerView(APIView):
    # Uncomment when authentication is set up.
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated, IsManager]
    def post(self, request, *args, **kwargs):
        today = timezone.localdate()
        tomorrow = today + timedelta(days=1)

        packages_qs = Package.objects.filter(
            status__in=["pending"],
            deliveryDate__lte=tomorrow 
        ).annotate(
            priority=Case(
                When(deliveryDate__lt=today, then=0),
                When(deliveryDate=today, then=1),
                When(deliveryDate=tomorrow, then=2),
                output_field=IntegerField()
            )
        ).order_by('priority', 'deliveryDate')
        packages_data = [{
            "packageID": pkg.packageID,
            "address": pkg.address,
            "latitude": float(pkg.latitude),
            "longitude": float(pkg.longitude),
            "recipient": pkg.recipient,
            "recipientPhoneNumber": pkg.recipientPhoneNumber,
            "deliveryDate": pkg.deliveryDate.isoformat(),
            "weight": float(pkg.weight),
            "status": pkg.status
        } for pkg in packages_qs]

        drivers = request.data.get('drivers')
        if not isinstance(drivers, list) or not drivers:
            return Response({"error": "No valid drivers provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Cluster the packages based on location and driver assignment.
        clustered_data = cluster_locations(
            packages_data=packages_data,
            driverUsernames=drivers
        )
        
        clustered_data = update_clustered_data_with_truck_and_driver(clustered_data, drivers=drivers)
        
        missing_truck_zones = [zone.get("zone") for zone in clustered_data if not zone.get("truckLicensePlate")]
        if missing_truck_zones:
            return Response(
                {"error": f"No available truck with sufficient capacity for zone(s): {missing_truck_zones}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        final_routes = connect_routes_and_assignments(clustered_data)
        
        try:
            create_routes_from_json(final_routes)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        Package.objects.filter(
            status="pending",
            deliveryDate__lte=tomorrow
        ).update(status="in_tranzit")
        
        routes_today = RouteAssignment.objects.filter(dateOfCreation=today, isActive=True)
        serializer = RouteAssignmentSerializer(routes_today, many=True)
        return Response(serializer.data)

class getRoutingBasedOnDriver(APIView):
    # Uncomment when authentication is set up.
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

class getAllRoutings(APIView):
    def get(self, request):
        today = timezone.localdate()
        routes_today = RouteAssignment.objects.filter(dateOfCreation=today, isActive=True)
        serializer = RouteAssignmentSerializer(routes_today, many=True)
        return Response(serializer.data)
    
class finishRoute(APIView):
    def post(self, request):
        driver = User.objects.get(username=request.data.get('username'))
        route = RouteAssignment.objects.get(driver=driver)
        if route.isActive:
            route.isActive = False
        else:
            return Response({"detail": "Route is already inactive"}, status=status.HTTP_400_BAD_REQUEST)
        route.save()
        return Response({"detail": "Marked route as finished"}, status=status.HTTP_201_CREATED)

class getReturnRoute(APIView):
    def post(self, request):
        try:
            current_lat = float(request.data.get('currentLat'))
            current_lng = float(request.data.get('currentLng'))
            default_lat = float(request.data.get('defaultLat'))
            default_lng = float(request.data.get('defaultLng'))
        except (TypeError, ValueError):
            return Response({"error": "Invalid coordinates provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Create input for OSRM
        osrm_input = {
            "locations": [
                {
                    "latitude": current_lat,
                    "longitude": current_lng
                },
                {
                    "latitude": default_lat,
                    "longitude": default_lng
                }
            ]
        }

        try:
            # Get route from OSRM
            osrm_response = _get_trip_service(osrm_input)
            
            if "error" in osrm_response:
                return Response({"error": "Failed to get route from OSRM"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Extract route coordinates
            if "trips" in osrm_response and osrm_response["trips"]:
                route_coordinates = osrm_response["trips"][0]["geometry"]["coordinates"]
                return Response({"route": route_coordinates}, status=status.HTTP_200_OK)
            
            return Response({"error": "No route found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Error calculating route: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class dropAllRoutes(APIView):
    def delete(self, request):
        count, _ = RouteAssignment.objects.all().delete()
        package_count = Package.objects.all().update(status='pending')
        return Response({"detail": f"{count} route assignments dropped."}, status=status.HTTP_200_OK)
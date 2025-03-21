from .serializers import RouteAssignmentSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from .clusterLocations import cluster_locations
from .createRoutes import create_routes
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

    Expected JSON format:
      [
          {
              "zone": 0,
              "driverUsername": "driver_1",
              "truckLicensePlate": "ABC123",   # Must be provided
              "route": [  # List of waypoint dicts
                  {
                      "waypoint_index": 0,
                      "package_info": {
                          "address": "Some address",
                          "latitude": 42.1234,
                          "longitude": 23.5678,
                          "recipient": "John Doe",
                          "recipientPhoneNumber": "1234567890",
                          "deliveryDate": "2025-03-21",
                          "weight": 5,
                          "status": "pending"
                      },
                      "route": [[longitude, latitude]],
                      ...
                  },
                  ...
              ]
          },
          ...
      ]
    """
    # Parse JSON string if needed.
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
            # Adjust field name here if needed (e.g., licensePlate vs. license_plate)
            truck = Truck.objects.get(licensePlate=truck_license_plate)
        except Truck.DoesNotExist:
            raise ValueError(f"Truck with license plate '{truck_license_plate}' does not exist.")

        # Sort waypoints by "waypoint_index" (defaulting to 0 if missing)
        sorted_waypoints = sorted(waypoints, key=lambda w: w.get("waypoint_index", 0))

        # Build packageSequence as a list of the full package_info dictionaries.
        package_sequence = []
        map_route = []
        for wp in sorted_waypoints:
            pkg_info = wp.get("package_info")
            if pkg_info:
                # Append the entire package_info dictionary.
                package_sequence.append(pkg_info)
            wp_route = wp.get("route", [])
            if isinstance(wp_route, list):
                map_route.extend(wp_route)

        # Create a RouteAssignment instance.
        # If you have a custom manager method (e.g., create_route),
        # ensure that it does not further alter package_sequence.
        route_instance = RouteAssignment.objects.create_route(
            driver=driver,
            packageSequence=package_sequence,  # This now holds the full package info dicts.
            mapRoute=map_route,
            truck=truck,
            dateOfCreation=timezone.now().date()
        )
        created_routes.append(route_instance)

    return created_routes



def update_clustered_data_with_truck_and_driver(clustered_data, drivers):
    updated_zones = []
    # Get available trucks ordered by capacity (ascending)
    available_trucks = list(Truck.objects.all().order_by('kilogramCapacity'))
    
    for zone_data in clustered_data:
        # zone_data is expected to be a dict that may have either "packages" or "locations"
        if isinstance(zone_data, dict):
            # Prefer "packages", but if not present use "locations"
            packages = zone_data.get("packages")
            if not packages:
                packages = zone_data.get("locations", [])
        elif isinstance(zone_data, list):
            packages = zone_data
        else:
            continue

        # Only keep items that are dicts (i.e. valid package/location dicts)
        valid_packages = [pkg for pkg in packages if isinstance(pkg, dict)]
        total_weight = sum(pkg.get("weight", 0) for pkg in valid_packages)

        # Assign a truck: choose the first available truck whose capacity is enough.
        truck_assigned = None
        for truck in available_trucks:
            if truck.kilogramCapacity >= total_weight:
                truck_assigned = truck.licensePlate
                available_trucks.remove(truck)
                break

        # Get the driverUsername from zone_data if present, else pop one from drivers list.
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
    Given a list of zone dictionaries (each having a "zone" key), transform them into
    a list suitable for routing (including building a "locations" list) and then merge
    the truck information back into the OSRM routing output.
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
        
        zone_dict = {
            "zone": zone_key,
            "driverUsername": zone_data.get("driverUsername"),
            "truckLicensePlate": zone_data.get("truckLicensePlate"),
            "locations": locations
        }
        zones_for_routing.append(zone_dict)
    
    # Call the OSRM routing function.
    osrm_routes = create_routes(zones_for_routing)
    
    # Merge truckLicensePlate info back.
    truck_lookup = {zone["zone"]: zone.get("truckLicensePlate") for zone in zones_for_routing}
    final_routes = []
    for route in osrm_routes:
        zone_key = route.get("zone")
        route["truckLicensePlate"] = truck_lookup.get(zone_key)
        final_routes.append(route)
    
    return final_routes

class RoutePlannerView(APIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated, IsManager]
    def post(self, request, *args, **kwargs):
        # Define today's date and tomorrow's date
        today = timezone.localdate()
        tomorrow = today + timedelta(days=1)

# Build the queryset:
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
        # -----------
        drivers = request.data.get('drivers')
        if not isinstance(drivers, list) or not drivers:
            return Response({"error": "No valid drivers provided."}, status=status.HTTP_400_BAD_REQUEST)

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

        routes_today = RouteAssignment.objects.filter(dateOfCreation=today, isActive = True)
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
        routes_today = RouteAssignment.objects.filter(dateOfCreation=today, isActive = True)
        serializer = RouteAssignmentSerializer(routes_today, many=True)
        return Response(serializer.data)
    
class finishRoute(APIView):
    def post(self, request):
        driver = User.objects.get(username = request.data.get('username'))
        route = RouteAssignment.objects.get(driver = driver)
        if route.isActive == True:
            route.isActive = False
        else:
            return Response({"detail": "Route is already inactive"}, status=status.HTTP_400_BAD_REQUEST)
        route.save()
        return Response({"detail": "Marked route as finished"}, status=status.HTTP_201_CREATED)

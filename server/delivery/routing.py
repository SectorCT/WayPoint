from .serializers import RouteAssignmentSerializer
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
from django.db import transaction


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

def update_clustered_data_with_truck_and_driver(clustered_data, drivers=None):
    """
    Updates the clustered_data structure with truck assignments and driver usernames.

    If clustered_data is a dict, it expects a key "drivers" containing a list of driver usernames,
    and keys like "zone1", "zone2", etc., each holding a list of package dicts.
    
    If clustered_data is a list, it assumes that each element is a zone dict (without a "drivers" key),
    and the drivers list must be provided via the 'drivers' parameter.
    
    For each zone:
      - Calculate the total weight from its packages.
      - Assign the smallest available truck (from Truck.objects.filter(isUsed=False))
        that can handle that weight.
      - Assign a driver from the provided list.
      
    The updated zone will be a dict with:
      {
        "packages": [...],
        "totalWeight": <calculated sum>,
        "truckLicensePlate": <assigned truck licensePlate or None>,
        "driverUsername": <assigned driver username or None>
      }
    """
    from .models import Truck

    # Determine driver list based on type of clustered_data
    if isinstance(clustered_data, dict):
        drivers = clustered_data.get("drivers", drivers or [])
        # Process only keys starting with "zone"
        zone_keys = [key for key in clustered_data.keys() if key.startswith("zone")]
        zone_items = [(key, clustered_data[key]) for key in zone_keys]
    elif isinstance(clustered_data, list):
        if drivers is None:
            raise ValueError("When clustered_data is a list, you must supply a drivers list.")
        zone_items = [(idx, zone) for idx, zone in enumerate(clustered_data)]
    else:
        raise TypeError("clustered_data must be either a dict or a list.")

    # Query available trucks (assumes Truck model has an isUsed field)
    available_trucks = list(Truck.objects.filter(isUsed=False).order_by('kilogramCapacity'))

    # Determine maximum assignments based on available trucks and drivers
    max_assignments = min(len(available_trucks), len(drivers))
    driver_index = 0

    # Iterate over each zone and update it
    for key, zone_data in zone_items:
        # If zone_data is a list (the packages), then wrap it in a dict.
        if isinstance(zone_data, list):
            packages = zone_data
        elif isinstance(zone_data, dict):
            # Try to get packages from key "packages"; if not present, assume zone_data is already the list.
            packages = zone_data.get("packages", zone_data)
        else:
            continue

        total_weight = sum(pkg.get("weight", 0) for pkg in packages)

        updated_zone = {
            "packages": packages,
            "totalWeight": total_weight,
            "truckLicensePlate": None,
            "driverUsername": None,
        }

        if driver_index < max_assignments and available_trucks:
            assigned_truck = None
            # Find the smallest available truck that can handle the total weight.
            for truck in available_trucks:
                if float(truck.kilogramCapacity) >= total_weight:
                    assigned_truck = truck
                    truck.isUsed = True
                    truck.save()
                    available_trucks.remove(truck)
                    break
            updated_zone["truckLicensePlate"] = assigned_truck.licensePlate if assigned_truck else None
            updated_zone["driverUsername"] = drivers[driver_index]
            driver_index += 1

        # Update the zone in place.
        if isinstance(clustered_data, dict):
            clustered_data[key] = updated_zone
        else:  # clustered_data is a list
            clustered_data[key] = updated_zone

    return clustered_data

def connect_routes_and_assignments(clustered_data):
    """
    Connects updated clustered data (with truck and driver assignments) with the OSRM routing process.
    
    Expects `clustered_data` to have keys:
      - "drivers": a list of driver usernames (may be left in but not used directly here)
      - "zone1", "zone2", etc.: each with a dict containing:
            "packages": list of package dicts,
            "totalWeight": total weight for the zone,
            "truckLicensePlate": assigned truck license plate,
            "driverUsername": assigned driver username
    
    This function will:
      1. Transform the zone entries into a list of zones for routing, where each zone dict has:
            - "zone": the zone label (e.g., "zone1")
            - "driverUsername": assigned driver username
            - "truckLicensePlate": assigned truck license (this will be re-added after routing)
            - "locations": a list of location dicts for OSRM
                (each location will include "address", "latitude", "longitude" and optionally a "package_info" key)
      2. Call create_routes with the list of zones.
      3. Merge the truck info back into the OSRM output.
    
    Returns:
      A list of zone route dicts that include:
          "zone", "driverUsername", "truckLicensePlate", "route" (OSRM route segments)
    """
    # Transform the zones from the clustered_data into a list
    zone_keys = [key for key in clustered_data.keys() if key.startswith("zone")]
    # Sort the zones (zone1, zone2, etc.)
    zone_keys.sort(key=lambda z: int(z.replace("zone", "")))
    
    zones_for_routing = []
    for zone_key in zone_keys:
        zone_data = clustered_data[zone_key]
        # Build the "locations" list for OSRM.
        # We assume each package can be a location.
        locations = []
        for pkg in zone_data.get("packages", []):
            # Here we use the package's address, latitude, longitude and attach all package info.
            loc = {
                "address": pkg.get("address", ""),
                "latitude": pkg.get("latitude"),
                "longitude": pkg.get("longitude"),
                "package_info": pkg  # include full package info (or adjust as needed)
            }
            locations.append(loc)
        
        zone_dict = {
            "zone": zone_key,
            "driverUsername": zone_data.get("driverUsername"),
            "truckLicensePlate": zone_data.get("truckLicensePlate"),
            "locations": locations
        }
        zones_for_routing.append(zone_dict)
    
    # Call create_routes (assumes it takes a list of zones)
    osrm_routes = create_routes(zones_for_routing)
    
    # Now merge the truckLicensePlate info into the OSRM output.
    # We assume the OSRM output is a list of dicts with keys: zone, driverUsername, route.
    # We'll add the truckLicensePlate (and optionally totalWeight if needed) for each zone.
    final_routes = []
    # Build a lookup dict for truck info from our zones_for_routing
    truck_lookup = {zone["zone"]: zone.get("truckLicensePlate") for zone in zones_for_routing}
    
    for route in osrm_routes:
        zone_key = route.get("zone")
        route["truckLicensePlate"] = truck_lookup.get(zone_key)
        final_routes.append(route)
    
    return final_routes

class RoutePlannerView(APIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated, IsManager]
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        today = timezone.now().date()
        tomorrow = today + timedelta(days=1)

        packages_qs = Package.objects.filter(deliveryDate__in=[today, tomorrow])
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

        # Ensure drivers list exists and is valid
        drivers = request.data.get('drivers')
        if not isinstance(drivers, list) or not drivers:
            return Response({"error": "No valid drivers provided."}, status=status.HTTP_400_BAD_REQUEST)

        clustered_data = cluster_locations(
            packages_data=packages_data,
            driverUsernames=drivers
        )
        clustered_data = update_clustered_data_with_truck_and_driver(clustered_data)
        final_routes = connect_routes_and_assignments(clustered_data)
        create_routes_from_json(final_routes)

        routes_today = RouteAssignment.objects.filter(dateOfCreation=today)
        serializer = RouteAssignmentSerializer(routes_today, many=True)
        return Response(serializer.data)
    
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
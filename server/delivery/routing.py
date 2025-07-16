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
from .models import Package, Truck, RouteAssignment, DeliveryHistory
from datetime import timedelta
from django.utils import timezone
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .permissions import IsManager
import json
from django.db.models import Case, When, IntegerField, Sum
from rest_framework import serializers

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
        
        # try:
        #     create_routes_from_json(final_routes)
        # except ValueError as e:
        #     return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        # Package.objects.filter(
        #     status="pending",
        #     deliveryDate__lte=tomorrow
        # ).update(status="in_tranzit")
        
        # routes_today = RouteAssignment.objects.filter(dateOfCreation=today, isActive=True)
        # serializer = RouteAssignmentSerializer(routes_today, many=True)
        return Response(final_routes)

def get_package_display_order(package_sequence):
    """
    Given a package sequence (list of dicts), return a mapping of {packageID: display_index}
    for all real packages (excluding ADMIN/default location), in the order they appear.
    Display index starts from 1.
    """
    display_order = {}
    display_idx = 1
    for pkg in package_sequence:
        if pkg.get('packageID') != 'ADMIN':
            display_order[pkg['packageID']] = display_idx
            display_idx += 1
    return display_order

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
        
        package_display_order = get_package_display_order(route.packageSequence)

        # Build OSRM input from current package sequence
        osrm_input = {"locations": []}
        for pkg in route.packageSequence:
            osrm_input["locations"].append({
                "address": pkg.get("address", ""),
                "latitude": pkg.get("latitude"),
                "longitude": pkg.get("longitude"),
                "package_info": pkg
            })
        # Only call OSRM if there are at least 2 locations
        osrm_legs = []
        if len(osrm_input["locations"]) >= 2:
            osrm_response = _get_trip_service(osrm_input)
            if "trips" in osrm_response and osrm_response["trips"]:
                osrm_legs = osrm_response["trips"][0].get("legs", [])
        
        return Response({
            "driver": driver.username,
            "packageSequence": route.packageSequence,
            "mapRoute": route.mapRoute,
            "packageDisplayOrder": package_display_order,
            "route": osrm_legs
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
        
        # Create delivery history directly
        try:
            # Get delivered packages for this route
            delivered_packages = Package.objects.filter(
                packageID__in=[pkg.get('packageID') for pkg in route.packageSequence if pkg.get('packageID') != 'ADMIN'],
                status='delivered'
            )
            
            # Calculate total weight
            total_kilos = delivered_packages.aggregate(
                total_weight=Sum('weight')
            )['total_weight'] or 0.00
            
            # Get duration from request or use default
            duration_hours = request.data.get('duration_hours', 0)
            
            # Create or update delivery history
            delivery_history, created = DeliveryHistory.objects.get_or_create(
                delivery_date=timezone.now().date(),
                driver=driver,
                defaults={
                    'truck': route.truck,
                    'total_packages': delivered_packages.count(),
                    'total_kilos': total_kilos,
                    'duration_hours': duration_hours,
                    'route_assignment': route
                }
            )
            
            if not created:
                # Update existing record
                delivery_history.truck = route.truck
                delivery_history.total_packages = delivered_packages.count()
                delivery_history.total_kilos = total_kilos
                delivery_history.duration_hours = duration_hours
                delivery_history.route_assignment = route
                delivery_history.save()
            
            # Add delivered packages to the history
            delivery_history.completed_packages.set(delivered_packages)
            
            return Response({
                "detail": "Marked route as finished and created delivery history",
                "delivery_history": {
                    "total_packages": delivery_history.total_packages,
                    "total_kilos": float(delivery_history.total_kilos),
                    "duration_hours": float(delivery_history.duration_hours)
                }
            }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            # If delivery history creation fails, still return success for route finishing
            return Response({
                "detail": "Marked route as finished but failed to create delivery history",
                "error": str(e)
            }, status=status.HTTP_201_CREATED)

class getReturnRoute(APIView):
    def post(self, request):
        try:
            current_lat = float(request.data.get('currentLat'))
            current_lng = float(request.data.get('currentLng'))
            default_lat = float(request.data.get('defaultLat'))
            default_lng = float(request.data.get('defaultLng'))
            driver_username = request.data.get('username')  # Add driver username
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
                
                # Create delivery history when driver requests return route (indicating they're done)
                if driver_username:
                    try:
                        print(f"Creating delivery history for driver: {driver_username}")
                        driver = User.objects.get(username=driver_username)
                        route = RouteAssignment.objects.get(driver=driver, isActive=True)
                        
                        print(f"Found route for driver: {route.routeID}")
                        
                        # Get delivered packages for this route
                        delivered_packages = Package.objects.filter(
                            packageID__in=[pkg.get('packageID') for pkg in route.packageSequence if pkg.get('packageID') != 'ADMIN'],
                            status='delivered'
                        )
                        
                        # Get undelivered packages for this route
                        undelivered_packages = Package.objects.filter(
                            packageID__in=[pkg.get('packageID') for pkg in route.packageSequence if pkg.get('packageID') != 'ADMIN'],
                            status='undelivered'
                        )
                        
                        print(f"Found {delivered_packages.count()} delivered packages")
                        print(f"Found {undelivered_packages.count()} undelivered packages")
                        
                        # Calculate total weight for delivered packages
                        delivered_kilos = delivered_packages.aggregate(
                            total_weight=Sum('weight')
                        )['total_weight'] or 0.00
                        
                        # Calculate total weight for undelivered packages
                        undelivered_kilos = undelivered_packages.aggregate(
                            total_weight=Sum('weight')
                        )['total_weight'] or 0.00
                        
                        print(f"Delivered kilos: {delivered_kilos}")
                        print(f"Undelivered kilos: {undelivered_kilos}")
                        
                        # Create or update delivery history
                        delivery_history, created = DeliveryHistory.objects.get_or_create(
                            delivery_date=timezone.now().date(),
                            driver=driver,
                            defaults={
                                'truck': route.truck,
                                'total_packages': delivered_packages.count(),
                                'total_kilos': delivered_kilos,
                                'undelivered_packages': undelivered_packages.count(),
                                'undelivered_kilos': undelivered_kilos,
                                'duration_hours': 0,  # Will be updated when route is actually finished
                                'route_assignment': route
                            }
                        )
                        
                        if not created:
                            # Update existing record
                            delivery_history.truck = route.truck
                            delivery_history.total_packages = delivered_packages.count()
                            delivery_history.total_kilos = delivered_kilos
                            delivery_history.undelivered_packages = undelivered_packages.count()
                            delivery_history.undelivered_kilos = undelivered_kilos
                            delivery_history.route_assignment = route
                            delivery_history.save()
                        
                        # Add delivered packages to the history
                        delivery_history.completed_packages.set(delivered_packages)
                        
                        # Add undelivered packages to the history
                        delivery_history.undelivered_packages_list.set(undelivered_packages)
                        
                        print(f"Successfully created/updated delivery history: {delivery_history.id}")

                        # Mark the truck as available again
                        route.truck.isUsed = False
                        route.truck.save()
                        print(f"Truck {route.truck.licensePlate} marked as available.")

                        # Mark the route as inactive
                        route.isActive = False
                        route.save()
                        print(f"Route {route.routeID} marked as inactive.")
                        
                    except Exception as e:
                        # Log error but don't fail the return route request
                        print(f"Error creating delivery history: {str(e)}")
                        import traceback
                        traceback.print_exc()
                
                return Response({"route": route_coordinates}, status=status.HTTP_200_OK)
            
            return Response({"error": "No route found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Error calculating route: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class dropAllRoutes(APIView):
    def delete(self, request):
        count, _ = RouteAssignment.objects.all().delete()
        package_count = Package.objects.all().update(status='pending')
        return Response({"detail": f"{count} route assignments dropped."}, status=status.HTTP_200_OK)

class CheckDriverStatusView(APIView):
    """
    Check if a driver has an active route or has completed their packages for the day (for today only)
    """
    def post(self, request):
        try:
            driver_username = request.data.get('username')
            if not driver_username:
                return Response({"error": "Driver username is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            driver = User.objects.get(username=driver_username)
            today = timezone.now().date()
            
            # Only consider active routes created today
            active_route = RouteAssignment.objects.filter(driver=driver, isActive=True, dateOfCreation=today).first()
            
            if active_route:
                # Check if all packages in the route have been processed (delivered or undelivered)
                route_packages = [pkg.get('packageID') for pkg in active_route.packageSequence if pkg.get('packageID') != 'ADMIN']
                delivered_packages = Package.objects.filter(
                    packageID__in=route_packages,
                    status='delivered'
                ).count()
                
                undelivered_packages = Package.objects.filter(
                    packageID__in=route_packages,
                    status='undelivered'
                ).count()
                
                total_packages = len(route_packages)
                processed_packages = delivered_packages + undelivered_packages
                
                if processed_packages == total_packages and total_packages > 0:
                    return Response({
                        "status": "completed",
                        "message": f"Driver {driver_username} has completed their route ({delivered_packages} delivered, {undelivered_packages} undelivered)",
                        "delivered_packages": delivered_packages,
                        "undelivered_packages": undelivered_packages,
                        "total_packages": total_packages
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        "status": "active",
                        "message": f"Driver {driver_username} has an active route with {delivered_packages} delivered, {undelivered_packages} undelivered, {total_packages - processed_packages} pending",
                        "delivered_packages": delivered_packages,
                        "undelivered_packages": undelivered_packages,
                        "total_packages": total_packages,
                        "pending_packages": total_packages - processed_packages
                    }, status=status.HTTP_200_OK)
            else:
                # Only consider delivery history for today
                delivery_history = DeliveryHistory.objects.filter(
                    driver=driver,
                    delivery_date=today
                ).first()
                
                if delivery_history:
                    return Response({
                        "status": "completed_today",
                        "message": f"Driver {driver_username} has completed their deliveries for today",
                        "delivered_packages": delivery_history.total_packages,
                        "total_kilos": float(delivery_history.total_kilos)
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        "status": "available",
                        "message": f"Driver {driver_username} is available for route assignment"
                    }, status=status.HTTP_200_OK)
                    
        except User.DoesNotExist:
            return Response({"error": "Driver not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Error checking driver status: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AssignTruckAndStartJourneyView(APIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated, IsManager]

    def post(self, request, *args, **kwargs):
        driver_username = request.data.get("driverUsername")
        truck_license_plate = request.data.get("truckLicensePlate")
        package_sequence = request.data.get("packageSequence")
        map_route = request.data.get("mapRoute")
        
        if not all([driver_username, truck_license_plate, package_sequence, map_route]):
            return Response({"error": "Missing required data."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            driver = User.objects.get(username=driver_username)
        except User.DoesNotExist:
            return Response({"error": f"Driver '{driver_username}' does not exist."}, status=status.HTTP_404_NOT_FOUND)

        try:
            truck = Truck.objects.get(licensePlate=truck_license_plate)
        except Truck.DoesNotExist:
            return Response({"error": f"Truck with license plate '{truck_license_plate}' does not exist."}, status=status.HTTP_404_NOT_FOUND)

        if truck.isUsed:
            return Response({"error": f"Truck with license plate '{truck_license_plate}' is already in use."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            route_instance = RouteAssignment.objects.create_route(
                driver=driver,
                packageSequence=package_sequence,
                mapRoute=map_route,
                truck=truck,
                dateOfCreation=timezone.now().date()
            )
        except serializers.ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        truck.isUsed = True
        truck.save()

        package_ids = [pkg.get("packageID") for pkg in package_sequence if pkg.get("packageID") != "ADMIN"]
        Package.objects.filter(packageID__in=package_ids).update(status="in_transit")

        serializer = RouteAssignmentSerializer(route_instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class recalculateRoute(APIView):
    """
    Recalculates the route for a driver from their current position to remaining delivery points.
    This is called when the driver deviates significantly from the planned route.
    """
    def post(self, request):
        try:
            driver_username = request.data.get('username')
            current_lat = float(request.data.get('currentLat'))
            current_lng = float(request.data.get('currentLng'))
        except (TypeError, ValueError):
            return Response({"error": "Invalid coordinates or username provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            driver = User.objects.get(username=driver_username)
            route = RouteAssignment.objects.get(driver=driver, isActive=True)
        except User.DoesNotExist:
            return Response({"error": "Driver not found"}, status=status.HTTP_404_NOT_FOUND)
        except RouteAssignment.DoesNotExist:
            return Response({"error": "No active route found for this driver"}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Get remaining undelivered packages (excluding ADMIN package)
            remaining_packages = [
                pkg for pkg in route.packageSequence 
                if pkg.get('packageID') != 'ADMIN' and 
                pkg.get('status') not in ['delivered', 'undelivered']
            ]

            if not remaining_packages:
                return Response({"error": "No remaining packages to deliver"}, status=status.HTTP_400_BAD_REQUEST)

            # Create OSRM input with current position as starting point
            osrm_input = {
                "locations": [
                    {
                        "latitude": current_lat,
                        "longitude": current_lng,
                        "name": "Current Position"
                    }
                ]
            }

            # Add remaining package locations
            for pkg in remaining_packages:
                osrm_input["locations"].append({
                    "latitude": pkg.get('latitude'),
                    "longitude": pkg.get('longitude'),
                    "name": pkg.get('address', ''),
                    "package_info": pkg
                })

            # Add the ADMIN package (factory) as the final destination
            admin_package = next((pkg for pkg in route.packageSequence if pkg.get('packageID') == 'ADMIN'), None)
            if admin_package:
                osrm_input["locations"].append({
                    "latitude": admin_package.get('latitude'),
                    "longitude": admin_package.get('longitude'),
                    "name": admin_package.get('address', 'Factory'),
                    "package_info": admin_package
                })

            # Get new route from OSRM
            osrm_response = _get_trip_service(osrm_input)
            
            if "error" in osrm_response:
                return Response({"error": "Failed to get route from OSRM"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Extract route coordinates
            if "trips" in osrm_response and osrm_response["trips"]:
                route_coordinates = osrm_response["trips"][0]["geometry"]["coordinates"]
                
                # Update the route in the database
                route.mapRoute = route_coordinates
                route.save()
                
                return Response({
                    "route": route_coordinates,
                    "message": "Route recalculated successfully",
                    "remaining_packages": len(remaining_packages)
                }, status=status.HTTP_200_OK)
            
            return Response({"error": "No route found"}, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            return Response({"error": f"Error recalculating route: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
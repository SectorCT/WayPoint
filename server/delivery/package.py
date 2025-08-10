from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Package, RouteAssignment
from .serializers import PackageSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .permissions import IsManager
from rest_framework.decorators import api_view
from .models import Office
from .serializers import OfficeSerializer
from rest_framework.generics import get_object_or_404
import math
import logging
from .models import User, OfficeDelivery
from .serializers import OfficeDeliverySerializer
from .email_service import DeliveryEmailService

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
    driver_username = request.data.get('driver_username')  # Get driver username for email
    
    if not package_id:
        return Response({"error": "packageID not provided"}, status=400)
    
    try:
        package = Package.objects.get(packageID=package_id)
    except Package.DoesNotExist:
        return Response({"error": "Package not found"}, status=404)
    
    if package.status == 'delivered':
        return Response({"error": "Package already delivered"}, status=400)
    
    # Get driver name for email notification
    driver_name = None
    if driver_username:
        try:
            driver = User.objects.get(username=driver_username)
            driver_name = f"{driver.first_name} {driver.last_name}".strip() or driver.username
        except User.DoesNotExist:
            driver_name = driver_username
    
    package.status = 'delivered'
    if signature:
        package.signature = signature
    package.save()
    
    # Send email notification to recipient
    try:
        DeliveryEmailService.send_delivery_notification(package, driver_name)
    except Exception as e:
        # Log error but don't fail the delivery
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to send delivery email for package {package_id}: {str(e)}")
    
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
    import logging
    logger = logging.getLogger(__name__)
    package_id = request.data.get('packageID')
    if not package_id:
        logger.error('No packageID provided')
        return Response({"error": "packageID not provided"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        package = Package.objects.get(packageID=package_id)
    except Package.DoesNotExist:
        logger.error(f'Package {package_id} not found')
        return Response({"error": "Package not found"}, status=status.HTTP_404_NOT_FOUND)
    if package.status == 'undelivered':
        logger.warning(f'Package {package_id} already marked as undelivered')
        return Response({"error": "Package already marked as undelivered"}, status=status.HTTP_400_BAD_REQUEST)
    # Mark package as undelivered
    package.status = 'undelivered'
    # Always assign to nearest office from all offices
    offices = Office.objects.all()
    if offices.exists() and package.latitude and package.longitude:
        def haversine(lat1, lon1, lat2, lon2):
            R = 6371  # km
            phi1 = math.radians(float(lat1))
            phi2 = math.radians(float(lat2))
            dphi = math.radians(float(lat2) - float(lat1))
            dlambda = math.radians(float(lon2) - float(lon1))
            a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
            return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        min_office = min(
            offices,
            key=lambda o: haversine(package.latitude, package.longitude, o.latitude, o.longitude)
        )
        package.office = min_office
        logger.info(f'Package {package_id} assigned to office {min_office.id} ({min_office.name})')
    else:
        logger.warning(f'No office assigned to package {package_id}')
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
    return Response({"detail": "Package marked as undelivered and assigned to nearest office if available"}, status=status.HTTP_200_OK)

class OfficeListCreate(APIView):
    def get(self, request):
        offices = Office.objects.all()
        serializer = OfficeSerializer(offices, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = OfficeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OfficeDetail(APIView):
    def get(self, request, pk):
        office = get_object_or_404(Office, pk=pk)
        serializer = OfficeSerializer(office)
        return Response(serializer.data)

    def put(self, request, pk):
        office = get_object_or_404(Office, pk=pk)
        serializer = OfficeSerializer(office, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        office = get_object_or_404(Office, pk=pk)
        office.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UndeliveredPackagesByOffice(APIView):
    def get(self, request, office_id):
        office = get_object_or_404(Office, pk=office_id)
        packages = office.packages.filter(status='undelivered')
        serializer = PackageSerializer(packages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UndeliveredPackagesRouteSuggestion(APIView):
    def get(self, request, driver_username):
        # Get all undelivered packages for this driver's active route
        try:
            route = RouteAssignment.objects.get(driver__username=driver_username, isActive=True)
        except RouteAssignment.DoesNotExist:
            return Response({"error": "No active route for this driver."}, status=status.HTTP_404_NOT_FOUND)
        
        # Get packages that are still undelivered (not delivered to offices)
        undelivered = []
        for pkg in route.packageSequence:
            if pkg.get('status') == 'undelivered':
                try:
                    db_pkg = Package.objects.get(packageID=pkg['packageID'])
                    # Check if this package has already been delivered to an office
                    if not OfficeDelivery.objects.filter(
                        driver__username=driver_username,
                        packages=db_pkg
                    ).exists():
                        undelivered.append(pkg)
                except Package.DoesNotExist:
                    continue
        
        if not undelivered:
            return Response({"detail": "No undelivered packages for this driver."}, status=status.HTTP_200_OK)
        
        # Group by office
        office_map = {}
        for pkg in undelivered:
            try:
                db_pkg = Package.objects.get(packageID=pkg['packageID'])
                office = db_pkg.office
                if office:
                    office_map.setdefault(office.id, {"office": OfficeSerializer(office).data, "packages": []})
                    office_map[office.id]["packages"].append(PackageSerializer(db_pkg).data)
            except Package.DoesNotExist:
                continue
        
        # Suggest order: sort offices by distance from the first undelivered package
        if office_map:
            first_pkg = next(iter(undelivered))
            db_first = Package.objects.get(packageID=first_pkg['packageID'])
            offices = [Office.objects.get(id=oid) for oid in office_map.keys()]
            def haversine(lat1, lon1, lat2, lon2):
                R = 6371
                phi1 = math.radians(float(lat1))
                phi2 = math.radians(float(lat2))
                dphi = math.radians(float(lat2) - float(lat1))
                dlambda = math.radians(float(lon2) - float(lon1))
                a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
                return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            offices_sorted = sorted(
                offices,
                key=lambda o: haversine(db_first.latitude, db_first.longitude, o.latitude, o.longitude)
            )
            suggested_order = [o.id for o in offices_sorted]
        else:
            suggested_order = []
        
        return Response({
            "undelivered_offices": list(office_map.values()),
            "suggested_office_order": suggested_order
        }, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_package(request, package_id):
    try:
        package = Package.objects.get(packageID=package_id)
    except Package.DoesNotExist:
        return Response({"error": "Package not found"}, status=404)
    serializer = PackageSerializer(package)
    return Response(serializer.data, status=200)


@api_view(['POST'])
def save_office_delivery(request):
    """Save office delivery information"""
    try:
        driver_username = request.data.get('driver_username')
        office_id = request.data.get('office_id')
        package_ids = request.data.get('package_ids', [])
        
        if not driver_username or not office_id:
            return Response({"error": "driver_username and office_id are required"}, status=400)
        
        # Get the driver and office
        try:
            driver = User.objects.get(username=driver_username)
            office = Office.objects.get(id=office_id)
        except (User.DoesNotExist, Office.DoesNotExist):
            return Response({"error": "Driver or office not found"}, status=404)
        
        # Get the active route for this driver
        try:
            route = RouteAssignment.objects.get(driver=driver, isActive=True)
        except RouteAssignment.DoesNotExist:
            return Response({"error": "No active route found for this driver"}, status=404)
        
        # Create office delivery record
        office_delivery = OfficeDelivery.objects.create(
            driver=driver,
            office=office,
            route_assignment=route
        )
        
        # Add packages to the office delivery
        if package_ids:
            packages = Package.objects.filter(packageID__in=package_ids)
            office_delivery.packages.set(packages)
        
        # Mark packages as delivered to office
        packages.update(status='delivered')
        
        # Send email notifications to recipients about office delivery
        driver_name = f"{driver.first_name} {driver.last_name}".strip() or driver.username
        for package in packages:
            try:
                DeliveryEmailService.send_office_delivery_notification(
                    package, 
                    office.name, 
                    driver_name
                )
            except Exception as e:
                # Log error but don't fail the office delivery
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to send office delivery email for package {package.packageID}: {str(e)}")
        
        # Update the route sequence to reflect delivered packages
        updated_sequence = []
        for pkg in route.packageSequence:
            if pkg.get('packageID') in package_ids:
                # Update status to delivered in route sequence
                pkg['status'] = 'delivered'
            updated_sequence.append(pkg)
        
        route.packageSequence = updated_sequence
        route.save()
        
        serializer = OfficeDeliverySerializer(office_delivery)
        return Response(serializer.data, status=201)
        
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
def optimize_office_route(request):
    """Optimize route for office deliveries using OSRM"""
    try:
        driver_username = request.data.get('driver_username')
        current_lat = float(request.data.get('current_lat'))
        current_lng = float(request.data.get('current_lng'))
        office_ids = request.data.get('office_ids', [])
        
        if not driver_username or not office_ids:
            return Response({"error": "driver_username and office_ids are required"}, status=400)
        
        # Get the driver
        try:
            driver = User.objects.get(username=driver_username)
        except User.DoesNotExist:
            return Response({"error": "Driver not found"}, status=404)
        
        # Get the offices
        try:
            offices = Office.objects.filter(id__in=office_ids)
            if len(offices) != len(office_ids):
                return Response({"error": "Some offices not found"}, status=404)
        except Exception:
            return Response({"error": "Invalid office IDs"}, status=400)
        
        # Import OSRM functions
        from .routing import osrm_trip, Location, extract_visit_plan
        
        # Create locations for OSRM: current position + offices
        locations = [
            Location(lon=current_lng, lat=current_lat, package_info={"address": "Current Position"})
        ]
        
        for office in offices:
            locations.append(Location(
                lon=float(office.longitude), 
                lat=float(office.latitude), 
                package_info={
                    "office_id": office.id,
                    "office_name": office.name,
                    "address": office.address,
                    "latitude": float(office.latitude),
                    "longitude": float(office.longitude)
                }
            ))
        
        # Call OSRM for optimization
        osrm_result = osrm_trip(locations)
        if "error" in osrm_result:
            return Response({"error": f"OSRM optimization failed: {osrm_result['error']}"}, status=500)
        
        # Extract optimized route and waypoints using the proper function
        visit_records = extract_visit_plan(osrm_result, locations)
        if not visit_records:
            return Response({"error": "Failed to extract visit plan from OSRM response"}, status=500)
        
        # Extract route coordinates
        route_coordinates = []
        if "trips" in osrm_result and osrm_result["trips"]:
            trip = osrm_result["trips"][0]
            if "geometry" in trip and "coordinates" in trip["geometry"]:
                route_coordinates = trip["geometry"]["coordinates"]
        
        # Create optimized office sequence from visit records
        optimized_offices = []
        for record in visit_records:
            # Skip the first record (current position) and any return legs
            if record.visit_order > 0 and not record.is_return_leg:
                office_info = record.package_info
                if "office_id" in office_info:
                    optimized_offices.append({
                        "office_id": office_info["office_id"],
                        "office_name": office_info["office_name"],
                        "address": office_info["address"],
                        "latitude": office_info["latitude"],
                        "longitude": office_info["longitude"],
                        "visit_order": record.visit_order
                    })
        
        return Response({
            "route_coordinates": route_coordinates,
            "optimized_offices": optimized_offices,
            "message": "Office route optimized successfully"
        }, status=200)
        
    except Exception as e:
        return Response({"error": str(e)}, status=500)
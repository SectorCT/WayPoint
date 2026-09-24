from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Package, RouteAssignment
from .serializers import PackageSerializer
from rest_framework.permissions import IsAuthenticated
from .permissions import IsManager, IsTrucker, get_user_company, ensure_own_username
from rest_framework.decorators import api_view, permission_classes
from .models import Office
from .serializers import OfficeSerializer
from rest_framework.generics import get_object_or_404
import math
import logging
from .models import OfficeDelivery
from .serializers import OfficeDeliverySerializer
from .email_service import DeliveryEmailService
from django.utils import timezone

logger = logging.getLogger(__name__)


def _haversine(lat1, lon1, lat2, lon2):
    R = 6371  # km
    phi1 = math.radians(float(lat1))
    phi2 = math.radians(float(lat2))
    dphi = math.radians(float(lat2) - float(lat1))
    dlambda = math.radians(float(lon2) - float(lon1))
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _route_package_ids(route):
    return {pkg.get("packageID") for pkg in route.packageSequence if pkg.get("packageID") != "ADMIN"}


def _check_and_release_truck_if_route_complete(route):
    """
    Check if all packages in the route are completed (delivered or undelivered)
    and release the truck if so.
    """
    try:
        # Get all package IDs from the route sequence (excluding ADMIN)
        package_ids = [
            pkg.get("packageID") for pkg in route.packageSequence
            if pkg.get("packageID") != "ADMIN"
        ]

        if not package_ids:
            logger.warning(f"No packages found in route {route.id}")
            return

        # Check if all packages are either delivered or undelivered
        packages = Package.objects.filter(packageID__in=package_ids)
        total_packages = packages.count()
        completed_packages = packages.filter(status__in=['delivered', 'undelivered']).count()

        logger.info(f"Route {route.id}: {completed_packages}/{total_packages} packages completed")

        # If all packages are completed, release the truck and mark route as inactive
        if completed_packages == total_packages and total_packages > 0:
            logger.info(f"All packages completed for route {route.id}. Releasing truck {route.truck.licensePlate}")

            # Release truck
            route.truck.isUsed = False
            route.truck.save()

            # Mark route as inactive
            route.isActive = False
            route.save()

            logger.info(f"Truck {route.truck.licensePlate} released and route {route.id} marked as inactive")

    except Exception as e:
        logger.exception(f"Error checking route completion for route {route.id}: {str(e)}")


def _set_status_in_route(route, package_id, new_status):
    """Update a package's status inside the route's stored packageSequence."""
    sequence = route.packageSequence
    for item in sequence:
        if item.get('packageID') == package_id:
            item['status'] = new_status
    route.packageSequence = sequence
    route.save()
    _check_and_release_truck_if_route_complete(route)


class createPackage(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def post(self, request):
        company = get_user_company(request.user)
        if company is None:
            return Response({"detail": "Manager does not have a company."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = PackageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(company=company)
            return Response({"detail": "Package created successfully.", "package": serializer.data}, status=status.HTTP_201_CREATED)

        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class createManyPackages(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def post(self, request):
        company = get_user_company(request.user)
        if company is None:
            return Response({"detail": "Manager does not have a company."}, status=status.HTTP_400_BAD_REQUEST)

        packages_data = request.data.get('packages', [])
        if not isinstance(packages_data, list):
            return Response({"detail": "Invalid data format. Expecting a list of packages."}, status=status.HTTP_400_BAD_REQUEST)

        created_packages = []
        errors = []

        for idx, package_data in enumerate(packages_data):
            serializer = PackageSerializer(data=package_data)
            if serializer.is_valid():
                serializer.save(company=company)
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
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
        packages = Package.objects.for_company(get_user_company(request.user))
        serializer = PackageSerializer(packages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class getTodaysPendingPackages(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
        # Same pending filter and "today" as StatisticsView: the client derives
        # "upcoming" as statistics.pending - len(today-pending).
        packages = Package.objects.pending_for_company(get_user_company(request.user)).filter(
            deliveryDate__lte=timezone.localdate()
        )
        serializer = PackageSerializer(packages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class deletePackage(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def delete(self, request, id):
        try:
            package = Package.objects.for_company(get_user_company(request.user)).get(packageID=id)
            package.delete()
            return Response({"detail": f"Package with ID {id} deleted."}, status=status.HTTP_200_OK)
        except ValueError:
            return Response({"detail": "Invalid package ID format."}, status=status.HTTP_400_BAD_REQUEST)
        except Package.DoesNotExist:
            return Response({"detail": f"Package with ID {id} not found."}, status=status.HTTP_404_NOT_FOUND)


def _package_on_callers_route(request, package_id):
    """Return (package, route) or an error Response for the trucker marking endpoints."""
    if not package_id:
        return None, Response({"error": "packageID not provided"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        package = Package.objects.get(packageID=package_id)
    except Package.DoesNotExist:
        return None, Response({"error": "Package not found"}, status=status.HTTP_404_NOT_FOUND)
    route = RouteAssignment.objects.active_for(request.user)
    if route is None or package_id not in _route_package_ids(route):
        return None, Response({"error": "Package is not on your active route"}, status=status.HTTP_403_FORBIDDEN)
    return (package, route), None


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsTrucker])
def mark_delivered(request):
    package_id = request.data.get('packageID')
    signature = request.data.get('signature')  # base64 string
    # `driver_username` in the body is ignored: the driver is the caller.

    found, error = _package_on_callers_route(request, package_id)
    if error:
        return error
    package, route = found

    if package.status == 'delivered':
        return Response({"error": "Package already delivered"}, status=400)

    package.status = 'delivered'
    if signature:
        package.signature = signature
    package.save()

    # Send email notification to recipient
    try:
        DeliveryEmailService.send_delivery_notification(package, request.user.username)
    except Exception as e:
        # Log error but don't fail the delivery
        logger.error(f"Failed to send delivery email for package {package_id}: {str(e)}")

    _set_status_in_route(route, package_id, 'delivered')

    return Response({"detail": "Package marked as delivered"}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsTrucker])
def mark_undelivered(request):
    package_id = request.data.get('packageID')

    found, error = _package_on_callers_route(request, package_id)
    if error:
        return error
    package, route = found

    if package.status == 'undelivered':
        logger.warning(f'Package {package_id} already marked as undelivered')
        return Response({"error": "Package already marked as undelivered"}, status=status.HTTP_400_BAD_REQUEST)
    # Mark package as undelivered
    package.status = 'undelivered'
    # Assign to the nearest office of the driver's company
    offices = Office.objects.filter(company=get_user_company(request.user))
    if offices.exists() and package.latitude and package.longitude:
        min_office = min(
            offices,
            key=lambda o: _haversine(package.latitude, package.longitude, o.latitude, o.longitude)
        )
        package.office = min_office
        logger.info(f'Package {package_id} assigned to office {min_office.id} ({min_office.name})')
    else:
        logger.warning(f'No office assigned to package {package_id}')
    package.save()

    _set_status_in_route(route, package_id, 'undelivered')

    return Response({"detail": "Package marked as undelivered and assigned to nearest office if available"}, status=status.HTTP_200_OK)


def _company_offices(request):
    company = get_user_company(request.user)
    if company is None:
        return Office.objects.none()
    return Office.objects.filter(company=company)


class OfficeListCreate(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
        offices = _company_offices(request)
        serializer = OfficeSerializer(offices, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        company = get_user_company(request.user)
        if company is None:
            return Response({"detail": "Manager does not have a company."}, status=status.HTTP_400_BAD_REQUEST)
        # The client sends its own company id; it must be the manager's company.
        requested = request.data.get('company')
        if requested is not None and str(requested) != str(company.id):
            return Response({"detail": "You can only create offices for your own company."}, status=status.HTTP_403_FORBIDDEN)
        data = request.data.copy()
        data['company'] = company.id
        serializer = OfficeSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OfficeDetail(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request, pk):
        office = get_object_or_404(_company_offices(request), pk=pk)
        serializer = OfficeSerializer(office)
        return Response(serializer.data)

    def put(self, request, pk):
        office = get_object_or_404(_company_offices(request), pk=pk)
        data = request.data.copy()
        data['company'] = office.company_id
        serializer = OfficeSerializer(office, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        office = get_object_or_404(_company_offices(request), pk=pk)
        office.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UndeliveredPackagesByOffice(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request, office_id):
        office = get_object_or_404(_company_offices(request), pk=office_id)
        packages = office.packages.filter(status='undelivered')
        serializer = PackageSerializer(packages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UndeliveredPackagesRouteSuggestion(APIView):
    permission_classes = [IsAuthenticated, IsTrucker]

    def get(self, request, driver_username):
        driver = ensure_own_username(request, driver_username)
        # Get all undelivered packages for this driver's route
        # First try active route, then try today's route (even if inactive)
        route = RouteAssignment.objects.current_for(driver)

        if not route:
            return Response({"error": "No route found for this driver today."}, status=status.HTTP_404_NOT_FOUND)

        # Get packages that are still undelivered (not delivered to offices)
        undelivered = []
        for pkg in route.packageSequence:
            if pkg.get('status') == 'undelivered':
                try:
                    db_pkg = Package.objects.get(packageID=pkg['packageID'])
                    # Check if this package has already been delivered to an office
                    if not OfficeDelivery.objects.filter(
                        driver=driver,
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
            offices_sorted = sorted(
                offices,
                key=lambda o: _haversine(db_first.latitude, db_first.longitude, o.latitude, o.longitude)
            )
            suggested_order = [o.id for o in offices_sorted]
        else:
            suggested_order = []

        return Response({
            "undelivered_offices": list(office_map.values()),
            "suggested_office_order": suggested_order
        }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsManager])
def get_package(request, package_id):
    try:
        package = Package.objects.for_company(get_user_company(request.user)).get(packageID=package_id)
    except Package.DoesNotExist:
        return Response({"error": "Package not found"}, status=404)
    serializer = PackageSerializer(package)
    return Response(serializer.data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsTrucker])
def save_office_delivery(request):
    """Save office delivery information"""
    driver_username = request.data.get('driver_username')
    office_id = request.data.get('office_id')
    package_ids = request.data.get('package_ids', [])

    if not driver_username or not office_id:
        return Response({"error": "driver_username and office_id are required"}, status=400)
    if not isinstance(package_ids, list):
        return Response({"error": "package_ids must be a list"}, status=400)

    driver = ensure_own_username(request, driver_username)
    try:
        try:
            office = _company_offices(request).get(id=office_id)
        except (Office.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Driver or office not found"}, status=404)

        # Get the route for this driver (active or today's route)
        route = RouteAssignment.objects.current_for(driver)

        if not route:
            return Response({"error": "No route found for this driver today"}, status=404)

        # Create office delivery record
        office_delivery = OfficeDelivery.objects.create(
            driver=driver,
            office=office,
            route_assignment=route
        )

        # Only packages on this driver's route can be handed to an office
        route_ids = _route_package_ids(route)
        packages = Package.objects.filter(packageID__in=[pid for pid in package_ids if pid in route_ids])
        office_delivery.packages.set(packages)

        # Send email notifications to recipients about office delivery
        # (evaluate before the status update below changes the queryset's rows)
        packages = list(packages)
        Package.objects.filter(pk__in=[p.pk for p in packages]).update(status='delivered')
        for package in packages:
            try:
                DeliveryEmailService.send_office_delivery_notification(
                    package,
                    office.name,
                    driver.username,
                    office.address
                )
            except Exception as e:
                # Log error but don't fail the office delivery
                logger.error(f"Failed to send office delivery email for package {package.packageID}: {str(e)}")

        # Update the route sequence to reflect delivered packages
        delivered_ids = {p.packageID for p in packages}
        updated_sequence = []
        for pkg in route.packageSequence:
            if pkg.get('packageID') in delivered_ids:
                # Update status to delivered in route sequence
                pkg['status'] = 'delivered'
            updated_sequence.append(pkg)

        route.packageSequence = updated_sequence
        route.save()

        # Check if all packages in this route are completed and release truck if so
        _check_and_release_truck_if_route_complete(route)

        serializer = OfficeDeliverySerializer(office_delivery)
        return Response(serializer.data, status=201)

    except Exception:
        logger.exception("Error saving office delivery")
        return Response({"error": "Could not save office delivery"}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsTrucker])
def optimize_office_route(request):
    """Optimize route for office deliveries using OSRM"""
    driver_username = request.data.get('driver_username')
    try:
        current_lat = float(request.data.get('current_lat'))
        current_lng = float(request.data.get('current_lng'))
    except (TypeError, ValueError):
        return Response({"error": "Invalid coordinates provided"}, status=400)
    office_ids = request.data.get('office_ids', [])

    if not driver_username or not office_ids:
        return Response({"error": "driver_username and office_ids are required"}, status=400)

    ensure_own_username(request, driver_username)

    try:
        # Get the offices
        try:
            offices = _company_offices(request).filter(id__in=office_ids)
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
            logger.error("OSRM office optimization failed: %s", osrm_result)
            return Response({"error": "Routing service unavailable"}, status=502)

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

    except Exception:
        logger.exception("Error optimizing office route")
        return Response({"error": "Could not optimize office route"}, status=500)

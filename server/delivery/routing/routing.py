from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from django.db.models import Case, When, IntegerField
from ..models import Package, Truck, RouteAssignment
from ..serializers import RouteAssignmentSerializer
from django.contrib.auth import get_user_model
from .clusterLocations import clusterLocations
from rest_framework.response import Response
from rest_framework.views import APIView
from .createRoutes import createRoutes
from ..permissions import IsManager
from django.utils import timezone
from rest_framework import status
from datetime import timedelta
import json

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

User = get_user_model()

def createRoutesFromJson(jsonData):
    if isinstance(jsonData, str):
        data = json.loads(jsonData)
    else:
        data = jsonData

    createdRoutes = []
    for routeObj in data:
        driverUsername = routeObj.get("driverUsername")
        truckLicensePlate = routeObj.get("truckLicensePlate")
        if not truckLicensePlate:
            raise ValueError("Truck license plate is required in the JSON data.")

        waypoints = routeObj.get("route", [])

        try:
            driver = User.objects.get(username=driverUsername)
        except User.DoesNotExist:
            raise ValueError(f"Driver '{driverUsername}' does not exist.")

        try:
            truck = Truck.objects.get(licensePlate=truckLicensePlate)
        except Truck.DoesNotExist:
            raise ValueError(f"Truck with license plate '{truckLicensePlate}' does not exist.")

        sortedWaypoints = sorted(waypoints, key=lambda w: w.get("waypoint_index", 0))
        packageSequence = []
        mapRoute = []

        for wp in sortedWaypoints:
            pkgInfo = wp.get("package_info")
            if pkgInfo:
                packageSequence.append(pkgInfo)
            wpRoute = wp.get("route", [])
            if isinstance(wpRoute, list):
                mapRoute.extend(wpRoute)

        routeInstance = RouteAssignment.objects.create_route(
            driver=driver,
            packageSequence=packageSequence,
            mapRoute=mapRoute,
            truck=truck,
            dateOfCreation=timezone.now().date()
        )
        createdRoutes.append(routeInstance)

    return createdRoutes


def updateClusteredDataWithTruckAndDriver(clusteredData, drivers):
    updatedZones = []
    availableTrucks = list(Truck.objects.all().order_by('kilogramCapacity'))

    for zoneData in clusteredData:
        packages = zoneData.get("packages") or zoneData.get("locations", [])
        validPackages = [pkg for pkg in packages if isinstance(pkg, dict)]
        totalWeight = sum(pkg.get("weight", 0) for pkg in validPackages)

        truckAssigned = None
        for truck in availableTrucks:
            if truck.kilogramCapacity >= totalWeight:
                truckAssigned = truck.licensePlate
                availableTrucks.remove(truck)
                break

        driverUsername = zoneData.get("driverUsername")
        if not driverUsername and drivers:
            driverUsername = drivers.pop(0)

        updatedZone = {
            "zone": zoneData.get("zone"),
            "packages": validPackages,
            "totalWeight": totalWeight,
            "truckLicensePlate": truckAssigned,
            "driverUsername": driverUsername,
        }
        updatedZones.append(updatedZone)

    return updatedZones


def connectRoutesAndAssignments(clusteredData):
    zonesForRouting = []

    for zoneData in clusteredData:
        if not isinstance(zoneData, dict):
            continue

        zoneKey = zoneData.get("zone")
        locations = [{
            "address": pkg.get("address", ""),
            "latitude": pkg.get("latitude"),
            "longitude": pkg.get("longitude"),
            "package_info": pkg
        } for pkg in zoneData.get("packages", [])]

        locations = [FACTORY_ADDRESS] + locations

        zonesForRouting.append({
            "zone": zoneKey,
            "driverUsername": zoneData.get("driverUsername"),
            "truckLicensePlate": zoneData.get("truckLicensePlate"),
            "locations": locations
        })

    osrmRoutes = createRoutes(zonesForRouting)

    truckLookup = {zone["zone"]: zone.get("truckLicensePlate") for zone in zonesForRouting}
    finalRoutes = []
    for route in osrmRoutes:
        zoneKey = route.get("zone")
        route["truckLicensePlate"] = truckLookup.get(zoneKey)
        finalRoutes.append(route)

    return finalRoutes


class RoutePlannerView(APIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated, IsManager]

    def post(self, request, *args, **kwargs):
        today = timezone.localdate()
        tomorrow = today + timedelta(days=1)

        packagesQuerySet = Package.objects.filter(
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

        packagesData = [{
            "order": i + 1,
            "packageID": pkg.packageID,
            "address": pkg.address,
            "latitude": float(pkg.latitude),
            "longitude": float(pkg.longitude),
            "recipient": pkg.recipient,
            "recipientPhoneNumber": pkg.recipientPhoneNumber,
            "deliveryDate": pkg.deliveryDate.isoformat(),
            "weight": float(pkg.weight),
            "status": pkg.status
        } for i, pkg in enumerate(packagesQuerySet)]

        drivers = request.data.get('drivers')
        if not isinstance(drivers, list) or not drivers:
            return Response({"error": "No valid drivers provided."}, status=status.HTTP_400_BAD_REQUEST)

        clusteredData = clusterLocations(packagesData, driverUsernames=drivers)
        clusteredData = updateClusteredDataWithTruckAndDriver(clusteredData, drivers)

        missingTruckZones = [zone.get("zone") for zone in clusteredData if not zone.get("truckLicensePlate")]
        if missingTruckZones:
            return Response(
                {"error": f"No available truck with sufficient capacity for zone(s): {missingTruckZones}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        finalRoutes = connectRoutesAndAssignments(clusteredData)

        try:
            createRoutesFromJson(finalRoutes)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        Package.objects.filter(
            status="pending",
            deliveryDate__lte=tomorrow
        ).update(status="in_tranzit")

        routesToday = RouteAssignment.objects.filter(dateOfCreation=today, isActive=True)
        serializer = RouteAssignmentSerializer(routesToday, many=True)
        return Response(serializer.data)


class GetRoutingBasedOnDriverView(APIView):
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


class GetAllRoutingsView(APIView):
    def get(self, request):
        today = timezone.localdate()
        routesToday = RouteAssignment.objects.filter(dateOfCreation=today, isActive=True)
        serializer = RouteAssignmentSerializer(routesToday, many=True)
        return Response(serializer.data)


class FinishRouteView(APIView):
    def post(self, request):
        driver = User.objects.get(username=request.data.get('username'))
        route = RouteAssignment.objects.get(driver=driver)
        if not route.isActive:
            return Response({"detail": "Route is already inactive"}, status=status.HTTP_400_BAD_REQUEST)
        route.isActive = False
        route.save()
        return Response({"detail": "Marked route as finished"}, status=status.HTTP_201_CREATED)


class DropAllRoutesView(APIView):
    def delete(self, request):
        routeCount, _ = RouteAssignment.objects.all().delete()
        Package.objects.all().update(status='pending')
        return Response({"detail": f"{routeCount} route assignments dropped."}, status=status.HTTP_200_OK)

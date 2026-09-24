"""Live truck positions.

Truckers report their latest position while a route is active; managers read
the latest position of each trucker in their company who has an active route.
Only the latest value is kept (no history).
"""
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import RouteAssignment, TruckerLocation
from .permissions import IsManager, IsTrucker, get_user_company


class LocationUpdateSerializer(serializers.Serializer):
    latitude = serializers.FloatField(min_value=-90, max_value=90)
    longitude = serializers.FloatField(min_value=-180, max_value=180)
    heading = serializers.FloatField(required=False, allow_null=True, min_value=0)
    speed = serializers.FloatField(required=False, allow_null=True, min_value=0)
    accuracy = serializers.FloatField(required=False, allow_null=True, min_value=0)

    def validate_heading(self, value):
        if value is not None and value >= 360:
            raise serializers.ValidationError('Ensure this value is less than 360.')
        return value


def location_json(location, route=None):
    data = {
        'driver': location.user.username,
        'latitude': location.latitude,
        'longitude': location.longitude,
        'heading': location.heading,
        'speed': location.speed,
        'accuracy': location.accuracy,
        'recorded_at': location.recorded_at.isoformat(),
    }
    if route is not None:
        data['routeID'] = route.routeID
        data['truck'] = route.truck.licensePlate
    return data


class UpdateMyLocationView(APIView):
    """POST /v1/delivery/location/: store the caller's current position."""

    permission_classes = [IsAuthenticated, IsTrucker]

    def post(self, request):
        serializer = LocationUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        values = serializer.validated_data
        location, _ = TruckerLocation.objects.update_or_create(
            user=request.user,
            defaults={
                'latitude': values['latitude'],
                'longitude': values['longitude'],
                # Optional fields not sent are cleared rather than kept stale.
                'heading': values.get('heading'),
                'speed': values.get('speed'),
                'accuracy': values.get('accuracy'),
            },
        )
        return Response(location_json(location), status=status.HTTP_200_OK)


class CompanyLocationsView(APIView):
    """GET /v1/delivery/locations/: latest position of each company trucker
    who has an active route (any active route counts, as on the Admin map)."""

    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
        routes = (
            RouteAssignment.objects.for_company(get_user_company(request.user))
            .filter(isActive=True, driver__live_location__isnull=False)
            .select_related('driver__live_location', 'truck')
            .order_by('driver__username')
        )
        return Response([location_json(route.driver.live_location, route) for route in routes])

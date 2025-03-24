from rest_framework import serializers
from datetime import date

from .models import Package, Truck, RouteAssignment
from .routing.fetchAddress import getAddressByCoordinates

# ---------------------- Route Assignment Serializer ----------------------

class RouteAssignmentSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='driver.username')
    truck = serializers.CharField(source='truck.licensePlate')

    class Meta:
        model = RouteAssignment
        fields = ['user', 'packageSequence', 'mapRoute', 'truck', 'dateOfCreation', 'routeID']

    def validate(self, data):
        request = self.context.get('request')
        user = request.user

        # Ensure only one active route per user
        activeRoutes = RouteAssignment.objects.filter(driver=user, isActive=True)
        if self.instance:
            activeRoutes = activeRoutes.exclude(pk=self.instance.pk)

        if activeRoutes.exists():
            raise serializers.ValidationError(
                "Only one active route assignment is allowed for the same user."
            )
        return data

# ---------------------- Package Serializer ----------------------

class PackageSerializer(serializers.ModelSerializer):
    packageID = serializers.ReadOnlyField()

    class Meta:
        model = Package
        fields = [
            'address', 'deliveryDate', 'latitude', 'longitude',
            'packageID', 'recipient', 'recipientPhoneNumber', 'status', 'weight'
        ]

    def validate_latitude(self, value):
        if not (-90 <= value <= 90):
            raise serializers.ValidationError('Latitude must be between -90 and 90 degrees.')
        return value

    def validate_longitude(self, value):
        if not (-180 <= value <= 180):
            raise serializers.ValidationError('Longitude must be between -180 and 180 degrees.')
        return value

    def validate_recipientPhoneNumber(self, value):
        if not value.isdigit():
            raise serializers.ValidationError('Phone number must contain only digits.')
        if not (7 <= len(value) <= 15):
            raise serializers.ValidationError('Phone number must be between 7 and 15 digits.')
        return value

    def validate_deliveryDate(self, value):
        if value < date.today():
            raise serializers.ValidationError('Delivery date cannot be in the past.')
        return value

    def validate_weight(self, value):
        if value <= 0:
            raise serializers.ValidationError('Weight must be a positive number.')
        return value

    def create(self, validated_data):
        try:
            lat = validated_data.get('latitude')
            lon = validated_data.get('longitude')
            if lat and lon:
                validated_data['address'] = getAddressByCoordinates(lat, lon) or validated_data.get('address')

            package = Package.objects.create_package(
                address=validated_data['address'],
                latitude=lat,
                longitude=lon,
                recipient=validated_data['recipient'],
                recipientPhoneNumber=validated_data['recipientPhoneNumber'],
                deliveryDate=validated_data['deliveryDate'],
                weight=validated_data['weight'],
                status=validated_data.get('status', 'pending')
            )
            return package
        except Exception as e:
            raise serializers.ValidationError(f"Error creating package: {str(e)}")

    def update(self, instance, validated_data):
        for field in ['address', 'latitude', 'longitude', 'recipient', 'recipientPhoneNumber', 'deliveryDate', 'weight', 'status']:
            setattr(instance, field, validated_data.get(field, getattr(instance, field)))
        instance.save()
        return instance

# ---------------------- Truck Serializer ----------------------

class TruckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Truck
        fields = ['licensePlate', 'kilogramCapacity']

    def validate(self, data):
        # Add validation logic if needed
        return data

    def create(self, validated_data):
        try:
            return Truck.objects.create_truck(
                licensePlate=validated_data['licensePlate'],
                kilogramCapacity=validated_data['kilogramCapacity']
            )
        except Exception as e:
            raise serializers.ValidationError(f"Error creating truck: {str(e)}")

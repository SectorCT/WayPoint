from rest_framework import serializers
from .models import Package, Truck
from .models import Package, RouteAssignment, DeliveryHistory
from .models import Office
from datetime import date


class RouteAssignmentSerializer(serializers.ModelSerializer):
    user  = serializers.CharField(source='driver.username')
    truck = serializers.CharField(source='truck.licensePlate')
    
    class Meta:
        model = RouteAssignment
        fields = ['user', 'packageSequence', 'mapRoute', 'truck', 'dateOfCreation', 'routeID']
    
    def validate(self, data):
        request = self.context.get('request')
        user = request.user
        qs = RouteAssignment.objects.filter(driver=user, isActive=True)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                "Only one active route assignment is allowed for the same user."
            )
        return data



class OfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Office
        fields = ['id', 'name', 'address', 'latitude', 'longitude', 'company']


class PackageSerializer(serializers.ModelSerializer):
    packageID = serializers.ReadOnlyField()
    office = OfficeSerializer(read_only=True)

    class Meta:
        model = Package
        fields = [
            'address', 'deliveryDate', 'latitude', 'longitude', 
            'packageID', 'recipient', 'recipientPhoneNumber', 'status', 'weight', 'office'
        ]

    def validate_latitude(self, value):
        if value < -90 or value > 90:
            raise serializers.ValidationError('Latitude must be between -90 and 90 degrees.')
        return value

    def validate_longitude(self, value):
        if value < -180 or value > 180:
            raise serializers.ValidationError('Longitude must be between -180 and 180 degrees.')
        return value

    def validate_recipientPhoneNumber(self, value):
        if not value.isdigit():
            raise serializers.ValidationError('Phone number must contain only digits.')
        if len(value) < 7 or len(value) > 15:
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
            package = Package.objects.create_package(
                address=validated_data['address'],
                latitude=validated_data['latitude'],
                longitude=validated_data['longitude'],
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
        instance.address = validated_data.get('address', instance.address)
        instance.latitude = validated_data.get('latitude', instance.latitude)
        instance.longitude = validated_data.get('longitude', instance.longitude)
        instance.recipient = validated_data.get('recipient', instance.recipient)
        instance.recipientPhoneNumber = validated_data.get('recipientPhoneNumber', instance.recipientPhoneNumber)
        instance.deliveryDate = validated_data.get('deliveryDate', instance.deliveryDate)
        instance.weight = validated_data.get('weight', instance.weight)
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance


class TruckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Truck
        fields = ['licensePlate', 'kilogramCapacity', 'isUsed']
    
    def validate(self, data):
        # Add any custom validation if needed
        return data

    def create(self, validated_data):
        try:
            truck = Truck.objects.create_truck(
                licensePlate=validated_data['licensePlate'],
                kilogramCapacity=validated_data['kilogramCapacity']
            )
            return truck
        except Exception as e:
            raise serializers.ValidationError(f"Error creating truck: {str(e)}")


class DeliveryHistorySerializer(serializers.ModelSerializer):
    driver_username = serializers.CharField(source='driver.username', read_only=True)
    truck_license = serializers.CharField(source='truck.licensePlate', read_only=True)
    date_formatted = serializers.SerializerMethodField()
    duration_formatted = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryHistory
        fields = [
            'id', 'delivery_date', 'driver_username', 'truck_license',
            'total_packages', 'total_kilos', 'duration_hours',
            'date_formatted', 'duration_formatted'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_date_formatted(self, obj):
        """Format date as '20th March' style"""
        from datetime import datetime
        date_obj = obj.delivery_date
        day = date_obj.day
        month = date_obj.strftime('%B')
        
        # Add ordinal suffix to day
        if 4 <= day <= 20 or 24 <= day <= 30:
            suffix = "th"
        else:
            suffix = ["st", "nd", "rd"][day % 10 - 1]
        
        return f"{day}{suffix} {month}"

    def get_duration_formatted(self, obj):
        """Format duration as '3:50' style (hours:minutes)"""
        hours = int(obj.duration_hours)
        minutes = int((obj.duration_hours - hours) * 60)
        return f"{hours}:{minutes:02d}"


class DeliveryHistorySummarySerializer(serializers.ModelSerializer):
    date_formatted = serializers.SerializerMethodField()
    duration_formatted = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryHistory
        fields = [
            'delivery_date', 'total_packages', 'total_kilos', 'duration_hours',
            'date_formatted', 'duration_formatted'
        ]

    def get_date_formatted(self, obj):
        """Format date as '20th March' style"""
        from datetime import datetime
        date_obj = obj.delivery_date
        day = date_obj.day
        month = date_obj.strftime('%B')
        
        # Add ordinal suffix to day
        if 4 <= day <= 20 or 24 <= day <= 30:
            suffix = "th"
        else:
            suffix = ["st", "nd", "rd"][day % 10 - 1]
        
        return f"{day}{suffix} {month}"

    def get_duration_formatted(self, obj):
        """Format duration as '3:50' style (hours:minutes)"""
        hours = int(obj.duration_hours)
        minutes = int((obj.duration_hours - hours) * 60)
        return f"{hours}:{minutes:02d}"

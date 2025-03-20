from rest_framework import serializers
from .models import Package, Truck

class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = ('address', 'latitude', 'longitude', 'recipient', 
                  'recipientPhoneNumber', 'deliveryDate', 'weight')

    def validate(self, data):
        errors = {}

        # Validate address
        if not data.get('address'):
            errors['address'] = 'Address is required.'

        # Validate latitude and longitude
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        if latitude is not None and (latitude < -90 or latitude > 90):
            errors['latitude'] = 'Latitude must be between -90 and 90 degrees.'
        if longitude is not None and (longitude < -180 or longitude > 180):
            errors['longitude'] = 'Longitude must be between -180 and 180 degrees.'

        # Validate recipient
        if not data.get('recipient'):
            errors['recipient'] = 'Recipient is required.'

        # Validate recipient phone number
        recipient_phone = data.get('recipientPhoneNumber')
        if not recipient_phone:
            errors['recipientPhoneNumber'] = 'Recipient phone number is required.'
        elif len(recipient_phone) < 7:
            errors['recipientPhoneNumber'] = 'Phone number must be at least 7 digits.'

        # Validate deliveryDate
        if data.get('deliveryDate') is None:
            errors['deliveryDate'] = 'Delivery date is required.'

        # Validate weight
        weight = data.get('weight')
        if weight is None:
            errors['weight'] = 'Weight is required.'
        elif weight <= 0:
            errors['weight'] = 'Weight must be a positive number.'

        if errors:
            raise serializers.ValidationError(errors)

        return data

    def create(self, validated_data):
        try:
            package = Package.objects.create_package(
                address=validated_data['address'],
                latitude=validated_data.get('latitude'),
                longitude=validated_data.get('longitude'),
                recipient=validated_data['recipient'],
                recipientPhoneNumber=validated_data['recipientPhoneNumber'],
                deliveryDate=validated_data['deliveryDate'],
                weight=validated_data['weight'],
            )
            return package
        except Exception as e:
            raise serializers.ValidationError(f"Error creating package: {str(e)}")
    
class TruckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Truck
        fields = ['licensePlate', 'kilogramCapacity']
    
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

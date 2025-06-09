from rest_framework import serializers
from .models import Company
from django.contrib.auth import get_user_model

User = get_user_model()

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'company_name', 'manager_email', 'created_at', 'status']
        read_only_fields = ['id', 'created_at']

class CompanyCreateSerializer(serializers.ModelSerializer):
    manager_password = serializers.CharField(write_only=True, required=True)
    manager_username = serializers.CharField(write_only=True, required=True)
    manager_phone = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Company
        fields = ['company_name', 'manager_email', 'manager_password', 'manager_username', 'manager_phone']

    def validate(self, data):
        # Check if manager email already exists
        if User.objects.filter(email=data['manager_email']).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        
        # Check if username already exists
        if User.objects.filter(username=data['manager_username']).exists():
            raise serializers.ValidationError("This username is already taken.")
        
        return data

    def create(self, validated_data):
        # Create the company
        company = Company.objects.create(
            company_name=validated_data['company_name'],
            manager_email=validated_data['manager_email']
        )

        # Create the manager user
        manager = User.objects.create_user(
            email=validated_data['manager_email'],
            username=validated_data['manager_username'],
            phoneNumber=validated_data['manager_phone'],
            password=validated_data['manager_password'],
            isManager=True,
            company=company,
            is_verified=True
        )

        return company 
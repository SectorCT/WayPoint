from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    company = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ('email', 'username', 'phoneNumber', 'isManager', 'company', 'verified')
    def get_company(self, obj):
        if obj.company:
            return {'id': obj.company.id, 'unique_id': obj.company.unique_id, 'name': obj.company.name}
        return None

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True, label="Confirm Password")
    company_id = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ('email', 'username', 'phoneNumber', 'password', 'password2', 'isManager', 'company_id')
        extra_kwargs = {
            'password': {'write_only': True},
        }
    
    def validate(self, data):
        # Check that the two passwords match.
        if data.get('password') != data.get('password2'):
            raise serializers.ValidationError("Passwords do not match.")
        # if not(data.get('email').exists) or not(data.get('password').exists) or not(data.get('phoneNumber').exists) or not(data.get('email').exists) or not(data.get('username').exists):
        #     raise serializers.ValidationError("Missing fields.")
        # Check if the email is already in use.
        if User.objects.filter(email=data.get('email')).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        # Check if the username is already in use.
        if User.objects.filter(username=data.get('username')).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        
        # Validate phone number format: must contain only digits if provided.
        phone = data.get('phoneNumber')
        if phone and not phone.isdigit():
            raise serializers.ValidationError("Phone number must contain only digits.")
        
        # Password complexity validation here.
        if len(data.get('password')) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        
        if not data.get('isManager'):
            # Truckers must provide company_id
            if not data.get('company_id'):
                raise serializers.ValidationError("Company ID is required for truckers.")
            from .models import Company
            try:
                company = Company.objects.get(unique_id=data['company_id'])
            except Company.DoesNotExist:
                raise serializers.ValidationError("Invalid company ID.")
            data['company_obj'] = company
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        company = validated_data.pop('company_obj', None)
        company_id = validated_data.pop('company_id', None)
        is_manager = validated_data.get('isManager')
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            phoneNumber=validated_data.get('phoneNumber'),
            password=validated_data['password'],
            isManager=is_manager,
            verified=is_manager,  # Managers are always verified
            company=company if not is_manager else None
        )
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.get('password', None)
        if password:
            instance.set_password(password)
        instance.username = validated_data.get('username', instance.username)
        instance.phoneNumber = validated_data.get('phoneNumber', instance.phoneNumber)
        try:
            instance.save()
        except Exception as e:
            raise serializers.ValidationError(f"Error updating user: {str(e)}")
        return instance

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError('Incorrect email or password.')
        data['user'] = user
        return data

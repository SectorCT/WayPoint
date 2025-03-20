from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True, label="Confirm Password")
    
    class Meta:
        model = User
        fields = ('email', 'username', 'phone_number', 'password', 'password2')
        extra_kwargs = {
            'password': {'write_only': True},
        }
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            phone_number=validated_data.get('phone_number'),
            password=validated_data['password']
        )
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.get('password', None)
        if password:
            instance.set_password(password)
        instance.username = validated_data.get('username', instance.username)
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)
        instance.save()
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

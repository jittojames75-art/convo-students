from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from apps.core.models import Organization, UserProfile

User = get_user_model()

class OrganizationSerializer(serializers.ModelSerializer):
    members_count = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'org_number', 'legal_name', 'cin_number', 
            'tax_id', 'email', 'phone', 'address', 'currency', 
            'currency_code', 'created_at', 'updated_at', 'members_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'members_count']

    def get_members_count(self, obj):
        return obj.members.count()

    def validate_org_number(self, value):
        if not value:
            return Organization.generate_unique_number()
        # Check uniqueness on create or update
        qs = Organization.objects.filter(org_number=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(f"Organization Number '{value}' already exists. Organization number must be unique.")
        return value

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    organization = serializers.SerializerMethodField()
    organization_number = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'is_staff', 'is_superuser', 'is_active', 'date_joined', 
            'role', 'organization', 'organization_number'
        ]

    def get_role(self, obj):
        if hasattr(obj, 'profile') and obj.profile.role:
            return obj.profile.role
        if obj.is_superuser:
            return 'Super Admin'
        if obj.is_staff:
            return 'Admin / Faculty'
        return 'Staff'

    def get_organization(self, obj):
        if hasattr(obj, 'profile') and obj.profile.organization:
            return obj.profile.organization.name
        return 'Convosis Technologies Private Limited'

    def get_organization_number(self, obj):
        if hasattr(obj, 'profile') and obj.profile.organization:
            return obj.profile.organization.org_number
        return 'CV-ORG-2026'

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    full_name = serializers.CharField(write_only=True, required=False, default='')
    role = serializers.CharField(write_only=True, required=False, default='Admin')
    org_number = serializers.CharField(write_only=True, required=False, default='')
    org_name = serializers.CharField(write_only=True, required=False, default='')

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'full_name', 'role', 'org_number', 'org_name']

    def create(self, validated_data):
        username = validated_data['username']
        email = validated_data.get('email', '')
        password = validated_data['password']
        full_name = validated_data.get('full_name', '')
        role = validated_data.get('role', 'Admin')
        org_number = validated_data.get('org_number', '').strip()
        org_name = validated_data.get('org_name', '').strip()

        first_name = full_name.split(' ')[0] if full_name else username
        last_name = ' '.join(full_name.split(' ')[1:]) if full_name and ' ' in full_name else ''

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        if role in ['Super Admin', 'Admin']:
            user.is_staff = True
        if role == 'Super Admin':
            user.is_superuser = True
        user.save()

        # Find or create Organization
        organization = None
        if org_number:
            try:
                organization = Organization.objects.get(org_number=org_number)
            except Organization.DoesNotExist:
                # Create with that unique org_number
                organization = Organization.objects.create(
                    org_number=org_number,
                    name=org_name or 'Convosis Technologies Private Limited',
                    legal_name=org_name or 'Convosis Technologies Private Limited'
                )
        else:
            # Default to the primary organization or create one
            organization = Organization.objects.first()
            if not organization:
                organization = Organization.objects.create(
                    org_number='CV-ORG-2026',
                    name='Convosis Technologies Private Limited',
                    legal_name='Convosis Technologies Private Limited'
                )

        # Create Profile
        UserProfile.objects.create(
            user=user,
            organization=organization,
            role=role
        )

        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    org_number = serializers.CharField(required=False, default='', allow_blank=True)

    def validate(self, data):
        username_or_email = data.get('username')
        password = data.get('password')

        user = authenticate(username=username_or_email, password=password)
        if not user:
            try:
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None

        if not user:
            raise serializers.ValidationError("Invalid credentials. Please verify username and password.")
        if not user.is_active:
            raise serializers.ValidationError("Account is inactive.")
        data['user'] = user
        return data

from rest_framework import status, views, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from apps.core.models import Organization, UserProfile
from apps.core.serializers import OrganizationSerializer, UserSerializer, RegisterSerializer, LoginSerializer
from apps.programs.models import Program
from apps.students.models import Student, Installment
from apps.attendance.models import AttendanceRecord
import uuid

User = get_user_model()

class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all().order_by('-created_at')
    serializer_class = OrganizationSerializer

    @action(detail=False, methods=['get'])
    def verify_number(self, request):
        """Check if an organization number is already in use or available"""
        number = request.query_params.get('number', '').strip()
        if not number:
            return Response({"error": "number query parameter required"}, status=status.HTTP_400_BAD_REQUEST)
        
        exists = Organization.objects.filter(org_number__iexact=number).exists()
        return Response({
            "org_number": number,
            "exists": exists,
            "is_unique": not exists,
            "message": "Organization number already taken" if exists else "Organization number is unique and available"
        })

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Retrieve the primary active organization"""
        org = Organization.objects.first()
        if not org:
            org = Organization.objects.create(
                org_number='CV-ORG-2026',
                name='Convosis Technologies Private Limited',
                legal_name='Convosis Technologies Private Limited'
            )
        return Response(OrganizationSerializer(org).data)


class RegisterView(views.APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user_data = UserSerializer(user).data
            return Response({
                "message": "User registered successfully",
                "user": user_data,
                "token": str(uuid.uuid4())
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(views.APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            user_data = UserSerializer(user).data
            
            # Fetch user's organization
            org = None
            if hasattr(user, 'profile') and user.profile.organization:
                org = OrganizationSerializer(user.profile.organization).data
            else:
                primary_org = Organization.objects.first()
                if primary_org:
                    org = OrganizationSerializer(primary_org).data

            return Response({
                "message": "Login successful",
                "user": user_data,
                "organization": org,
                "token": str(uuid.uuid4())
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Protect primary admin root account
        if instance.username.lower() == 'admin' and User.objects.filter(is_superuser=True).count() <= 1:
            return Response({"error": "Cannot delete the primary Super Admin root account."}, status=status.HTTP_400_BAD_REQUEST)
        username = instance.username
        self.perform_destroy(instance)
        return Response({"message": f"User '{username}' was deleted successfully."}, status=status.HTTP_200_OK)


class AdminStatsView(views.APIView):
    def get(self, request):
        total_programs = Program.objects.count()
        total_students = Student.objects.count()
        total_installments = Installment.objects.count()
        paid_installments = Installment.objects.filter(status='paid').count()
        overdue_installments = Installment.objects.filter(status='overdue').count()
        
        # Calculate collection metrics
        paid_items = Installment.objects.filter(status='paid')
        total_collected = sum(inst.amount for inst in paid_items) if paid_items.exists() else 0
        
        pending_items = Installment.objects.filter(status__in=['pending', 'overdue'])
        total_pending = sum(inst.amount for inst in pending_items) if pending_items.exists() else 0

        total_users = User.objects.count()
        org = Organization.objects.first()
        
        return Response({
            "total_programs": total_programs,
            "total_students": total_students,
            "total_installments": total_installments,
            "paid_installments": paid_installments,
            "overdue_installments": overdue_installments,
            "total_collected": float(total_collected),
            "total_pending": float(total_pending),
            "total_users": total_users,
            "system_status": "Healthy (PostgreSQL/SQLite Online)",
            "organization": org.name if org else "Convosis Technologies Private Limited",
            "org_number": org.org_number if org else "CV-ORG-2026"
        })

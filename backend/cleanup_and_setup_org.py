import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'convosis_backend.settings')
django.setup()

from apps.core.models import Organization, UserProfile
from apps.students.models import Student, Installment, PaymentReceipt
from apps.attendance.models import AttendanceRecord
from apps.communications.models import EmailLog
from django.contrib.auth import get_user_model

User = get_user_model()

print("1. Removing dummy data...")
# Remove dummy students, installments, receipts
st_count = Student.objects.count()
Student.objects.all().delete()
print(f"Removed {st_count} dummy students and linked installments/receipts.")

# Remove dummy attendance records
att_count = AttendanceRecord.objects.count()
AttendanceRecord.objects.all().delete()
print(f"Removed {att_count} dummy attendance records.")

# Remove dummy email logs
log_count = EmailLog.objects.count()
EmailLog.objects.all().delete()
print(f"Removed {log_count} dummy email logs.")

print("2. Setting up default unique Organization...")
org, created = Organization.objects.get_or_create(
    org_number='CV-ORG-2026',
    defaults={
        'name': 'Convosis Technologies Private Limited',
        'legal_name': 'Convosis Technologies Private Limited',
        'cin_number': 'U72900KA2026PTC184920',
        'tax_id': 'GSTIN29AAACC1234D1Z5',
        'email': 'contact@convosis.com',
        'phone': '+91 (800) 584-TECH',
        'address': 'Innovation Hub, Cyber City, Bangalore, India',
        'currency': '₹',
        'currency_code': 'INR'
    }
)
print(f"Organization established: {org.name} [Org Number: {org.org_number}] (Created: {created})")

print("3. Linking existing users to Organization...")
for u in User.objects.all():
    profile, p_created = UserProfile.objects.get_or_create(
        user=u,
        defaults={
            'organization': org,
            'role': 'Super Admin' if u.is_superuser else 'Admin / Faculty'
        }
    )
    if not profile.organization:
        profile.organization = org
        profile.save()
    print(f"Linked user {u.username} to organization {org.org_number} with role {profile.role}")

print("Cleanup and Organization setup finished successfully.")


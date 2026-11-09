from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class Organization(models.Model):
    name = models.CharField(max_length=255, default='Convosis Technologies Private Limited')
    org_number = models.CharField(max_length=64, unique=True, db_index=True)
    legal_name = models.CharField(max_length=255, blank=True, default='Convosis Technologies Private Limited')
    cin_number = models.CharField(max_length=64, blank=True, default='U72900KA2026PTC184920')
    tax_id = models.CharField(max_length=64, blank=True, default='GSTIN29AAACC1234D1Z5')
    email = models.EmailField(blank=True, default='contact@convosis.com')
    phone = models.CharField(max_length=50, blank=True, default='+91 (800) 584-TECH')
    address = models.TextField(blank=True, default='Innovation Hub, Cyber City, Bangalore, India')
    currency = models.CharField(max_length=10, default='₹')
    currency_code = models.CharField(max_length=10, default='INR')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} [{self.org_number}]"

    @classmethod
    def generate_unique_number(cls):
        while True:
            code = f"CV-ORG-{uuid.uuid4().hex[:6].upper()}"
            if not cls.objects.filter(org_number=code).exists():
                return code


class UserProfile(models.Model):
    user = models.OneToOneField(User, related_name='profile', on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, related_name='members', on_delete=models.SET_NULL, null=True, blank=True)
    role = models.CharField(max_length=64, default='Staff')
    phone = models.CharField(max_length=50, blank=True, default='')

    def __str__(self):
        return f"{self.user.username} ({self.role})"

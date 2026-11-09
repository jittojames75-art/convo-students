import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'convosis_backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@convosis.com', 'admin123')
    print("Superuser created: username=admin, password=admin123")
else:
    u = User.objects.get(username='admin')
    u.set_password('admin123')
    u.is_superuser = True
    u.is_staff = True
    u.save()
    print("Superuser updated: username=admin, password=admin123")


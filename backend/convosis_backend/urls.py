"""
URL configuration for Convosis Technologies Private Limited backend.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers

# Import ViewSets
from apps.programs.views import ProgramViewSet, ModuleViewSet, SubModuleViewSet
from apps.students.views import StudentViewSet, InstallmentViewSet, PaymentReceiptViewSet
from apps.attendance.views import AttendanceRecordViewSet
from apps.communications.views import EmailTemplateViewSet, EmailLogViewSet, TriggerReminderAPIView
from apps.core.views import UserViewSet, OrganizationViewSet, RegisterView, LoginView, AdminStatsView

router = routers.DefaultRouter()
router.register(r'organizations', OrganizationViewSet, basename='organization')
router.register(r'programs', ProgramViewSet, basename='program')
router.register(r'modules', ModuleViewSet, basename='module')
router.register(r'submodules', SubModuleViewSet, basename='submodule')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'installments', InstallmentViewSet, basename='installment')
router.register(r'receipts', PaymentReceiptViewSet, basename='receipt')
router.register(r'attendance', AttendanceRecordViewSet, basename='attendance')
router.register(r'templates', EmailTemplateViewSet, basename='template')
router.register(r'email-logs', EmailLogViewSet, basename='email-log')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/register/', RegisterView.as_view(), name='api-register'),
    path('api/auth/login/', LoginView.as_view(), name='api-login'),
    path('api/admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('api/trigger-due-reminders/', TriggerReminderAPIView.as_view(), name='trigger-reminders'),
]

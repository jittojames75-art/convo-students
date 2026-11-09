from django.db import models
from apps.students.models import Student

class EmailTemplate(models.Model):
    TEMPLATE_TYPES = (
        ('admission', 'Admission Kit'),
        ('fee_reminder', 'Installment Due Reminder'),
        ('fee_overdue', 'Fee Overdue Alert'),
        ('receipt', 'Payment Receipt'),
        ('attendance_alert', 'Low Attendance Warning'),
        ('custom', 'Custom Broadcast'),
    )

    id = models.CharField(max_length=64, primary_key=True)
    name = models.CharField(max_length=150)
    type = models.CharField(max_length=50, choices=TEMPLATE_TYPES, default='custom')
    subject = models.CharField(max_length=255)
    body = models.TextField()
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.type})"


class EmailLog(models.Model):
    student = models.ForeignKey(Student, related_name='email_logs', on_delete=models.SET_NULL, null=True, blank=True)
    student_name = models.CharField(max_length=150)
    email = models.EmailField()
    template_id = models.CharField(max_length=64, blank=True)
    subject = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default='Delivered')
    trigger_source = models.CharField(max_length=150, default='Automated')

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.timestamp} - {self.email} ({self.status})"


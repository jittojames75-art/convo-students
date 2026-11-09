from django.db import models
from apps.students.models import Student
from apps.programs.models import Program

class AttendanceRecord(models.Model):
    STATUS_CHOICES = (
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('excused', 'Excused'),
    )

    date = models.DateField()
    student = models.ForeignKey(Student, related_name='attendance_records', on_delete=models.CASCADE)
    program = models.ForeignKey(Program, related_name='attendance_records', on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='present')
    note = models.CharField(max_length=255, blank=True)

    class Meta:
        unique_together = ('date', 'student')
        ordering = ['-date', 'student']

    def __str__(self):
        return f"{self.date} - {self.student.name} ({self.status})"


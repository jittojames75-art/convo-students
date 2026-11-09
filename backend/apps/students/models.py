from django.db import models
from apps.programs.models import Program

class Student(models.Model):
    PAYMENT_MODES = (
        ('full', 'Full Tuition'),
        ('installment', '3-Month Installments'),
    )
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('graduated', 'Graduated'),
        ('suspended', 'Suspended'),
    )

    student_id = models.CharField(max_length=64, primary_key=True)
    name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=50, blank=True)
    avatar = models.URLField(blank=True, default='')
    
    program = models.ForeignKey(Program, related_name='students', on_delete=models.SET_NULL, null=True, blank=True)
    program_title = models.CharField(max_length=200, blank=True)
    program_type = models.CharField(max_length=50, default='course')
    
    enrollment_date = models.DateField()
    payment_mode = models.CharField(max_length=20, choices=PAYMENT_MODES, default='installment')
    
    total_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    remaining_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.student_id})"


class Installment(models.Model):
    STATUS_CHOICES = (
        ('paid', 'Paid'),
        ('pending', 'Pending'),
        ('overdue', 'Overdue'),
    )

    student = models.ForeignKey(Student, related_name='installments', on_delete=models.CASCADE)
    month = models.IntegerField(default=1) # 1, 2, or 3
    title = models.CharField(max_length=150, default='Month 1 Installment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    paid_date = models.DateField(null=True, blank=True)
    transaction_ref = models.CharField(max_length=100, null=True, blank=True)
    payment_method = models.CharField(max_length=100, null=True, blank=True)
    note = models.TextField(blank=True)

    class Meta:
        ordering = ['month', 'due_date']

    def __str__(self):
        return f"{self.student.name} - Month {self.month} ({self.status})"


class PaymentReceipt(models.Model):
    receipt_number = models.CharField(max_length=100, unique=True, primary_key=True)
    student = models.ForeignKey(Student, related_name='receipts', on_delete=models.CASCADE)
    installment = models.ForeignKey(Installment, related_name='receipts', on_delete=models.SET_NULL, null=True, blank=True)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField()
    payment_method = models.CharField(max_length=100, default='Online Card')
    remaining_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Receipt #{self.receipt_number} - {self.student.name}"


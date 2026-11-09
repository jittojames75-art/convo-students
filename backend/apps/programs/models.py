from django.db import models

class Program(models.Model):
    PROGRAM_TYPES = (
        ('course', 'Course'),
        ('internship', 'Internship'),
        ('dual', 'Course + Internship'),
    )

    id = models.CharField(max_length=64, primary_key=True)
    title = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=PROGRAM_TYPES, default='course')
    category = models.CharField(max_length=100, default='Technology')
    duration = models.CharField(max_length=100, default='4 Months')
    total_hours = models.CharField(max_length=100, default='200+ Hours')
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.9)
    enrolled_count = models.IntegerField(default=0)
    badge = models.CharField(max_length=100, default='Popular')
    description = models.TextField(blank=True)
    
    # Fees & Installments (Default: 15,000 + 18% GST)
    base_fee = models.DecimalField(max_digits=10, decimal_places=2, default=15000)
    gst_percent = models.DecimalField(max_digits=5, decimal_places=2, default=18.0)
    gst_amount = models.DecimalField(max_digits=10, decimal_places=2, default=2700)
    full_amount = models.DecimalField(max_digits=10, decimal_places=2, default=17700)
    installment_months = models.IntegerField(default=3)
    installment_amount = models.DecimalField(max_digits=10, decimal_places=2, default=5900)
    
    # Instructor / Mentor
    instructor_name = models.CharField(max_length=150, blank=True)
    instructor_role = models.CharField(max_length=200, blank=True)
    mentor_name = models.CharField(max_length=150, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.get_type_display()})"

    def save(self, *args, **kwargs):
        if not self.id:
            import uuid
            from django.utils.text import slugify
            prefix = 'combo' if self.type in ['dual', 'course_internship'] else ('intern' if self.type == 'internship' else 'course')
            base_slug = slugify(self.title) or 'program'
            candidate = f"{prefix}-{base_slug}"[:60]
            if Program.objects.filter(id=candidate).exists():
                candidate = f"{candidate[:50]}-{uuid.uuid4().hex[:6]}"
            self.id = candidate
        if not self.gst_amount and self.gst_percent:
            self.gst_amount = round(self.base_fee * (self.gst_percent / 100), 2)
        if not self.full_amount or self.full_amount == 1200:
            self.full_amount = self.base_fee + (self.gst_amount or 0)
        if not self.installment_amount and self.installment_months > 0:
            self.installment_amount = round(self.full_amount / self.installment_months, 2)
        super().save(*args, **kwargs)


class Module(models.Model):
    program = models.ForeignKey(Program, related_name='modules', on_delete=models.CASCADE)
    module_code = models.CharField(max_length=50, default='Module 1')
    title = models.CharField(max_length=255)
    weeks = models.CharField(max_length=100, default='Weeks 1-4')
    order = models.IntegerField(default=1)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.program.title} - {self.module_code}: {self.title}"


class SubModule(models.Model):
    module = models.ForeignKey(Module, related_name='submodules', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    hours = models.CharField(max_length=50, default='4 Hours')
    lab_description = models.TextField(blank=True)
    order = models.IntegerField(default=1)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.module.module_code} > {self.title}"


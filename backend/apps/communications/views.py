from rest_framework import viewsets, views, status
from rest_framework.response import Response
from .models import EmailTemplate, EmailLog
from .serializers import EmailTemplateSerializer, EmailLogSerializer
from apps.students.models import Student

class EmailTemplateViewSet(viewsets.ModelViewSet):
    queryset = EmailTemplate.objects.all()
    serializer_class = EmailTemplateSerializer


class EmailLogViewSet(viewsets.ModelViewSet):
    queryset = EmailLog.objects.all()
    serializer_class = EmailLogSerializer


class TriggerReminderAPIView(views.APIView):
    def post(self, request):
        """Dispatches automated installment due reminders to all pending students"""
        students = Student.objects.filter(payment_mode='installment', remaining_balance__gt=0)
        dispatched_count = 0
        
        for student in students:
            pending_inst = student.installments.filter(status__in=['pending', 'overdue']).first()
            if pending_inst:
                EmailLog.objects.create(
                    student=student,
                    student_name=student.name,
                    email=student.email,
                    template_id='tpl-installment-due',
                    subject=f"Friendly Reminder: Month {pending_inst.month} Installment Due for {student.program_title}",
                    trigger_source='Bulk Automation: Due Reminder Queue'
                )
                dispatched_count += 1

        return Response({
            'message': f'Dispatched reminders to {dispatched_count} candidates',
            'count': dispatched_count
        })


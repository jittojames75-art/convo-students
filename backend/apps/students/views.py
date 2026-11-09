from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Student, Installment, PaymentReceipt
from .serializers import StudentSerializer, InstallmentSerializer, PaymentReceiptSerializer
from datetime import date

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().prefetch_related('installments')
    serializer_class = StudentSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'email', 'student_id', 'program_title']

    @action(detail=True, methods=['post'], url_path='record-payment')
    def record_payment(self, request, pk=None):
        student = self.get_object()
        installment_id = request.data.get('installment_id')
        payment_method = request.data.get('payment_method', 'Online Card')
        transaction_ref = request.data.get('transaction_ref', f"TXN-{date.today().strftime('%Y%m%d%H%M%S')}")
        note = request.data.get('note', '')

        try:
            installment = student.installments.get(id=installment_id)
        except Installment.DoesNotExist:
            return Response({'error': 'Installment not found'}, status=status.HTTP_404_NOT_FOUND)

        installment.status = 'paid'
        installment.paid_date = date.today()
        installment.transaction_ref = transaction_ref
        installment.payment_method = payment_method
        installment.note = note
        installment.save()

        # Update student totals
        student.paid_amount += installment.amount
        student.remaining_balance = max(0, student.total_fee - student.paid_amount)
        student.save()

        # Create Receipt
        receipt = PaymentReceipt.objects.create(
            receipt_number=transaction_ref,
            student=student,
            installment=installment,
            amount=installment.amount,
            payment_date=date.today(),
            payment_method=payment_method,
            remaining_balance=student.remaining_balance
        )

        return Response({
            'message': 'Payment settled and receipt generated',
            'receipt': PaymentReceiptSerializer(receipt).data,
            'student': StudentSerializer(student).data
        })


class InstallmentViewSet(viewsets.ModelViewSet):
    queryset = Installment.objects.all()
    serializer_class = InstallmentSerializer


class PaymentReceiptViewSet(viewsets.ModelViewSet):
    queryset = PaymentReceipt.objects.all().select_related('student')
    serializer_class = PaymentReceiptSerializer


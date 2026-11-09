from rest_framework import serializers
from .models import Student, Installment, PaymentReceipt

class InstallmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Installment
        fields = '__all__'


class PaymentReceiptSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.name')
    student_email = serializers.ReadOnlyField(source='student.email')

    class Meta:
        model = PaymentReceipt
        fields = '__all__'


class StudentSerializer(serializers.ModelSerializer):
    installments = InstallmentSerializer(many=True, read_only=True)

    class Meta:
        model = Student
        fields = '__all__'


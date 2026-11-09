from rest_framework import serializers
from .models import Program, Module, SubModule

class SubModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubModule
        fields = ['id', 'title', 'hours', 'lab_description', 'order']


class ModuleSerializer(serializers.ModelSerializer):
    submodules = SubModuleSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'program', 'module_code', 'title', 'weeks', 'order', 'submodules']


class ProgramSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False, allow_blank=True)
    modules = ModuleSerializer(many=True, read_only=True)

    class Meta:
        model = Program
        fields = [
            'id', 'title', 'type', 'category', 'duration', 'total_hours',
            'rating', 'enrolled_count', 'badge', 'description',
            'base_fee', 'gst_percent', 'gst_amount',
            'full_amount', 'installment_months', 'installment_amount',
            'instructor_name', 'instructor_role', 'mentor_name',
            'modules', 'created_at', 'updated_at'
        ]


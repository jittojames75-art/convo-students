from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import AttendanceRecord
from .serializers import AttendanceRecordSerializer

class AttendanceRecordViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.all().select_related('student', 'program')
    serializer_class = AttendanceRecordSerializer
    filterset_fields = ['date', 'status', 'program']

    @action(detail=False, methods=['post'], url_path='bulk-mark')
    def bulk_mark(self, request):
        records_data = request.data.get('records', [])
        saved = []
        for r in records_data:
            obj, created = AttendanceRecord.objects.update_or_create(
                date=r['date'],
                student_id=r['student_id'],
                defaults={'status': r.get('status', 'present'), 'program_id': r.get('program_id')}
            )
            saved.append(obj)
        return Response({'message': f'Updated {len(saved)} attendance records', 'count': len(saved)})


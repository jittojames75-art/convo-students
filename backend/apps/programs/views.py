from rest_framework import viewsets, filters
from .models import Program, Module, SubModule
from .serializers import ProgramSerializer, ModuleSerializer, SubModuleSerializer

class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all().prefetch_related('modules__submodules')
    serializer_class = ProgramSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'category', 'description']


class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all().prefetch_related('submodules')
    serializer_class = ModuleSerializer


class SubModuleViewSet(viewsets.ModelViewSet):
    queryset = SubModule.objects.all()
    serializer_class = SubModuleSerializer


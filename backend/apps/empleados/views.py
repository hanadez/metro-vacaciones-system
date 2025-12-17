from rest_framework import viewsets
from .models import *
from .serializers import *

class EmpleadoViewSet(viewsets.ModelViewSet):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer
from rest_framework import viewsets
from .models import *
from .serializers import *

class SolicitudViewSet(viewsets.ModelViewSet):
    queryset = Solicitud.objects.all()
    serializer_class = SolicitudSerializer

class SaldoVacacionesViewSet(viewsets.ModelViewSet):
    queryset = SaldoVacaciones.objects.all()
    serializer_class = SaldoVacacionesSerializer

class HistorialSaldoViewSet(viewsets.ModelViewSet):
    queryset = HistorialSaldo.objects.all()
    serializer_class = HistorialSaldoSerializer

from rest_framework import viewsets
from .models import *
from .serializers import *

class FirmanteViewSet(viewsets.ModelViewSet):
    queryset = Firmante.objects.all()
    serializer_class = FirmanteSerializer

class RequisitoViewSet(viewsets.ModelViewSet):
    queryset = Requisito.objects.all()
    serializer_class = RequisitoSerializer

class TipoDiaEconomicoViewSet(viewsets.ModelViewSet):
    queryset = TipoDiaEconomico.objects.all()
    serializer_class = TipoDiaEconomicoSerializer

class TipoVacacionViewSet(viewsets.ModelViewSet):
    queryset = TipoVacacion.objects.all()
    serializer_class = TipoVacacionSerializer

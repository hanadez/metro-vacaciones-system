from rest_framework import viewsets
from .models import *
from .serializers import *

class ConfigGlobalViewSet(viewsets.ModelViewSet):
    queryset = ConfigGlobal.objects.all()
    serializer_class = ConfigGlobalSerializer

class ReglaAreaViewSet(viewsets.ModelViewSet):
    queryset = ReglaArea.objects.all()
    serializer_class = ReglaAreaSerializer
from rest_framework import viewsets
from .models import *
from .serializers import *

class AreaViewSet(viewsets.ModelViewSet):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
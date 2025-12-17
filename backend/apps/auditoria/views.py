from rest_framework import viewsets
from .models import *
from .serializers import *

class LogAuditoriaViewSet(viewsets.ModelViewSet):
    queryset = LogAuditoria.objects.all()
    serializer_class = LogAuditoriaSerializer
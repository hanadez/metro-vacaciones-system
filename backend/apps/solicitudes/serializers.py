from rest_framework import serializers
from .models import *

class SolicitudSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solicitud
        fields = '__all__'

class SaldoVacacionesSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaldoVacaciones
        fields = '__all__'

class HistorialSaldoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistorialSaldo
        fields = '__all__'
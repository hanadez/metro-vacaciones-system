from rest_framework import serializers
from .models import *

class FirmanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Firmante
        fields = '__all__'

class RequisitoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Requisito
        fields = '__all__'

class TipoDiaEconomicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoDiaEconomico
        fields = '__all__'

class TipoVacacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoVacacion
        fields = '__all__'
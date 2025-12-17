from rest_framework import serializers
from .models import *

class ConfigGlobalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfigGlobal
        fields = '__all__'

class ReglaAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReglaArea
        fields = '__all__'
from django.contrib import admin
from .models import *

# Registrar modelos
admin.site.register(Firmante)
admin.site.register(Requisito)
admin.site.register(TipoDiaEconomico)
admin.site.register(TipoVacacion)
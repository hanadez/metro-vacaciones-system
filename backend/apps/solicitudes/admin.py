from django.contrib import admin
from .models import *

# Registrar modelos
admin.site.register(Solicitud)
admin.site.register(SaldoVacaciones)
admin.site.register(HistorialSaldo)

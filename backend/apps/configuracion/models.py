from django.db import models
from apps.authentication.models import Usuario

    
class ConfigGlobal(models.Model):
    clave = models.CharField(max_length=100, unique=True)
    valor = models.JSONField()
    descripcion = models.TextField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    actualizado_por = models.ForeignKey(
        Usuario, null=True, blank=True, on_delete=models.SET_NULL
    )

    class Meta:
        db_table = "config_global"
        indexes = [models.Index(fields=["clave"])]

    def __str__(self):
        return self.clave
from django.db import models
from apps.authentication.models import Usuario
from django.utils import timezone

    
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
    
class ReglaArea(models.Model):
    TIPO_REGLA_CHOICES = [
        ('prorroga', 'Prórroga'),
        ('dias_anticipacion', 'Días de anticipación'),
        ('taquilla_validacion', 'Taquilla validación'),
    ]

    id = models.AutoField(primary_key=True)
    area = models.ForeignKey(
        'areas.Area',
        on_delete=models.CASCADE,
        related_name='reglas_area'
    )
    tipo_regla = models.CharField(max_length=50, choices=TIPO_REGLA_CHOICES)
    configuracion = models.JSONField()
    activo = models.BooleanField(default=True)

    fecha_creacion = models.DateTimeField(default=timezone.now)
    fecha_actualizacion = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'reglas_area'
        indexes = [
            models.Index(fields=['area'], name='idx_reglas_area'),
            models.Index(fields=['tipo_regla'], name='idx_reglas_tipo'),
            models.Index(fields=['activo'], name='idx_reglas_activo'),
        ]

    def __str__(self):
        return f"{self.area} - {self.tipo_regla}"
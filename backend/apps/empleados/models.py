from django.db import models

class Empleado(models.Model):
    area = models.ForeignKey('areas.Area', on_delete=models.RESTRICT)

    numero_expediente = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=150)

    fecha_ingreso = models.DateField()
    categoria_laboral = models.CharField(max_length=100, blank=True, null=True)
    linea_metro = models.CharField(max_length=50, blank=True, null=True)
    turno = models.CharField(max_length=50, blank=True, null=True)
    es_taquilla = models.BooleanField(default=False)

    activo = models.BooleanField(default=True)

    calendario_descansos = models.JSONField(blank=True, null=True)

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["area"]),
            models.Index(fields=["numero_expediente"]),
            models.Index(fields=["activo"]),
            models.Index(fields=["es_taquilla"]),
        ]

    def __str__(self):
        return f"{self.numero_expediente} - {self.nombre} {self.apellidos}"
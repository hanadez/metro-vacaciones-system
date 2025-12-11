"""
Modelos para solicitudes de vacaciones y días económicos
"""

from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
import uuid


class Solicitud(models.Model):
    """
    Modelo principal para solicitudes de vacaciones y días económicos
    """
    
    TIPO_SOLICITUD = (
        ('vacaciones', 'Vacaciones'),
        ('dia_economico', 'Día Económico'),
    )
    
    ESTADOS = (
        ('pendiente', 'Pendiente'),
        ('aprobada', 'Aprobada'),
        ('rechazada', 'Rechazada'),
        ('cancelada', 'Cancelada'),
    )
    
    # Identificación
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    folio = models.CharField(max_length=50, unique=True, db_index=True)
    
    # Relaciones
    empleado = models.ForeignKey(
        'empleados.Empleado',
        on_delete=models.RESTRICT,
        related_name='solicitudes'
    )
    area = models.ForeignKey(
        'areas.Area',
        on_delete=models.RESTRICT,
        related_name='solicitudes'
    )
    
    # Tipo de solicitud
    tipo_solicitud = models.CharField(max_length=20, choices=TIPO_SOLICITUD)
    tipo_vacacion = models.ForeignKey(
        'catalogos.TipoVacacion',
        on_delete=models.RESTRICT,
        null=True,
        blank=True,
        related_name='solicitudes'
    )
    tipo_dia_economico = models.ForeignKey(
        'catalogos.TipoDiaEconomico',
        on_delete=models.RESTRICT,
        null=True,
        blank=True,
        related_name='solicitudes'
    )
    
    # Fechas
    fecha_solicitud = models.DateField(default=timezone.now)
    fecha_inicio = models.DateField()
    fecha_reanudar = models.DateField()
    dias_habiles = models.IntegerField(validators=[MinValueValidator(1)])
    
    # Periodo (solo para vacaciones)
    periodo = models.CharField(max_length=50, blank=True, null=True)
    
    # Detalles adicionales
    observaciones = models.TextField(blank=True, null=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    
    # PDF
    pdf_path = models.CharField(max_length=500, blank=True, null=True)
    pdf_generado_en = models.DateTimeField(null=True, blank=True)
    
    # Validaciones especiales
    tiene_conflicto_descanso = models.BooleanField(default=False)
    mensaje_warning = models.TextField(blank=True, null=True)
    
    # Metadatos
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    creado_por = models.ForeignKey(
        'authentication.Usuario',
        on_delete=models.SET_NULL,
        null=True,
        related_name='solicitudes_creadas'
    )
    
    class Meta:
        db_table = 'solicitudes'
        verbose_name = 'Solicitud'
        verbose_name_plural = 'Solicitudes'
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['folio']),
            models.Index(fields=['empleado', 'tipo_solicitud']),
            models.Index(fields=['area', 'estado']),
            models.Index(fields=['fecha_inicio']),
        ]
    
    def __str__(self):
        return f"{self.folio} - {self.empleado.get_full_name()} - {self.get_tipo_solicitud_display()}"
    
    def clean(self):
        """Validaciones personalizadas"""
        from django.core.exceptions import ValidationError
        
        # Validar que solo un tipo esté presente
        if self.tipo_solicitud == 'vacaciones':
            if not self.tipo_vacacion:
                raise ValidationError('Debe seleccionar un tipo de vacación')
            if self.tipo_dia_economico:
                raise ValidationError('No puede tener tipo de día económico en solicitud de vacaciones')
        
        elif self.tipo_solicitud == 'dia_economico':
            if not self.tipo_dia_economico:
                raise ValidationError('Debe seleccionar un tipo de día económico')
            if self.tipo_vacacion:
                raise ValidationError('No puede tener tipo de vacación en solicitud de día económico')
        
        # Validar que fecha_reanudar sea posterior a fecha_inicio
        if self.fecha_reanudar <= self.fecha_inicio:
            raise ValidationError('La fecha de reanudación debe ser posterior a la fecha de inicio')
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def generar_folio(self):
        """Genera un folio único para la solicitud"""
        from django.conf import settings
        import random
        
        prefix = settings.APP_SETTINGS.get('FOLIO_PREFIX', 'SOL')
        timestamp = timezone.now().strftime('%Y%m%d')
        random_suffix = ''.join([str(random.randint(0, 9)) for _ in range(4)])
        
        return f"{prefix}-{timestamp}-{random_suffix}"


class SaldoVacaciones(models.Model):
    """
    Saldos de vacaciones por empleado y periodo
    """
    
    empleado = models.ForeignKey(
        'empleados.Empleado',
        on_delete=models.CASCADE,
        related_name='saldos'
    )
    periodo = models.CharField(max_length=50)  # "2024-1", "2024-2"
    
    dias_otorgados = models.IntegerField(validators=[MinValueValidator(0)])
    dias_utilizados = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    dias_disponibles = models.IntegerField(validators=[MinValueValidator(0)])
    
    fecha_inicio_periodo = models.DateField()
    fecha_fin_periodo = models.DateField()
    fecha_calculo = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'saldos_vacaciones'
        verbose_name = 'Saldo de Vacaciones'
        verbose_name_plural = 'Saldos de Vacaciones'
        unique_together = ('empleado', 'periodo')
        ordering = ['empleado', '-periodo']
        indexes = [
            models.Index(fields=['empleado', 'periodo']),
        ]
    
    def __str__(self):
        return f"{self.empleado.get_full_name()} - {self.periodo} - {self.dias_disponibles} días"
    
    def actualizar_dias_utilizados(self, dias):
        """Actualiza los días utilizados y disponibles"""
        self.dias_utilizados += dias
        self.dias_disponibles = self.dias_otorgados - self.dias_utilizados
        self.save()


class HistorialSaldo(models.Model):
    """
    Registro histórico de movimientos en saldos de vacaciones
    """
    
    TIPOS_MOVIMIENTO = (
        ('otorgamiento', 'Otorgamiento'),
        ('uso', 'Uso'),
        ('ajuste', 'Ajuste Manual'),
        ('cancelacion', 'Cancelación'),
    )
    
    empleado = models.ForeignKey(
        'empleados.Empleado',
        on_delete=models.CASCADE,
        related_name='historial_saldos'
    )
    periodo = models.CharField(max_length=50)
    
    tipo_movimiento = models.CharField(max_length=50, choices=TIPOS_MOVIMIENTO)
    dias_antes = models.IntegerField()
    dias_movimiento = models.IntegerField()
    dias_despues = models.IntegerField()
    
    solicitud = models.ForeignKey(
        'Solicitud',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='historial_saldo'
    )
    
    descripcion = models.TextField(blank=True, null=True)
    fecha_movimiento = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'historial_saldos'
        verbose_name = 'Historial de Saldo'
        verbose_name_plural = 'Historial de Saldos'
        ordering = ['-fecha_movimiento']
        indexes = [
            models.Index(fields=['empleado', 'periodo']),
            models.Index(fields=['-fecha_movimiento']),
        ]
    
    def __str__(self):
        return f"{self.empleado.get_full_name()} - {self.tipo_movimiento} - {self.dias_movimiento} días"
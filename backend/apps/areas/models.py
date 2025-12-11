"""
Modelos para la gestión de áreas
"""

from django.db import models
from django.core.validators import RegexValidator


class Area(models.Model):
    """
    Modelo para las áreas del Metro
    Cada área tiene su propia configuración y administradores
    """
    
    nombre = models.CharField(max_length=200)
    codigo = models.CharField(
        max_length=50,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^[A-Z0-9_]+$',
                message='El código solo puede contener letras mayúsculas, números y guiones bajos'
            )
        ]
    )
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    
    # Configuración específica del área (almacenada como JSON)
    configuracion = models.JSONField(default=dict, blank=True)
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'areas'
        verbose_name = 'Área'
        verbose_name_plural = 'Áreas'
        ordering = ['nombre']
        indexes = [
            models.Index(fields=['codigo']),
            models.Index(fields=['activo']),
        ]
    
    def __str__(self):
        return f"{self.nombre} ({self.codigo})"
    
    def get_configuracion_valor(self, clave, default=None):
        """
        Obtiene un valor específico de la configuración del área
        
        Args:
            clave: Clave a buscar en la configuración
            default: Valor por defecto si no existe
        
        Returns:
            El valor de la configuración o el default
        """
        return self.configuracion.get(clave, default)
    
    def set_configuracion_valor(self, clave, valor):
        """
        Establece un valor en la configuración del área
        
        Args:
            clave: Clave a establecer
            valor: Valor a guardar
        """
        self.configuracion[clave] = valor
        self.save(update_fields=['configuracion', 'fecha_actualizacion'])
    
    def tiene_prorroga_activa(self):
        """Verifica si el área tiene la prórroga activa"""
        return self.configuracion.get('prorroga_activa', False)
    
    def get_dias_prorroga(self):
        """Obtiene los días de prórroga configurados"""
        return self.configuracion.get('prorroga_dias', 30)
    
    def get_dias_anticipacion(self):
        """Obtiene los días de anticipación configurados"""
        return self.configuracion.get('dias_anticipacion', 30)
    
    def get_empleados_count(self):
        """Retorna el número de empleados activos en el área"""
        return self.empleados.filter(activo=True).count()
    
    def get_solicitudes_pendientes_count(self):
        """Retorna el número de solicitudes pendientes"""
        return self.solicitudes.filter(estado='pendiente').count()
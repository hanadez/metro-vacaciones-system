"""
Modelos para auditoría y logs del sistema
"""

from django.db import models


class LogAuditoria(models.Model):
    """
    Registro de auditoría de acciones en el sistema
    """
    
    usuario = models.ForeignKey(
        'authentication.Usuario',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='logs_auditoria'
    )
    
    accion = models.CharField(max_length=100)
    tabla_afectada = models.CharField(max_length=100, blank=True, null=True)
    registro_id = models.IntegerField(null=True, blank=True)
    
    datos_anteriores = models.JSONField(null=True, blank=True)
    datos_nuevos = models.JSONField(null=True, blank=True)
    
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    
    fecha_hora = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'logs_auditoria'
        verbose_name = 'Log de Auditoría'
        verbose_name_plural = 'Logs de Auditoría'
        ordering = ['-fecha_hora']
        indexes = [
            models.Index(fields=['usuario']),
            models.Index(fields=['fecha_hora']),
            models.Index(fields=['tabla_afectada']),
        ]
    
    def __str__(self):
        usuario_str = self.usuario.email if self.usuario else 'Sistema'
        return f"{usuario_str} - {self.accion} - {self.fecha_hora}"
    
    @classmethod
    def crear_log(cls, usuario, accion, tabla=None, registro_id=None, 
                  datos_anteriores=None, datos_nuevos=None, 
                  ip_address=None, user_agent=None):
        """
        Crea un registro de auditoría
        
        Args:
            usuario: Usuario que realiza la acción
            accion: Descripción de la acción
            tabla: Tabla afectada
            registro_id: ID del registro afectado
            datos_anteriores: Datos antes del cambio
            datos_nuevos: Datos después del cambio
            ip_address: IP del usuario
            user_agent: User agent del navegador
        
        Returns:
            Instancia del log creado
        """
        return cls.objects.create(
            usuario=usuario,
            accion=accion,
            tabla_afectada=tabla,
            registro_id=registro_id,
            datos_anteriores=datos_anteriores,
            datos_nuevos=datos_nuevos,
            ip_address=ip_address,
            user_agent=user_agent
        )
"""
Modelos de autenticación y usuarios
"""

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UsuarioManager(BaseUserManager):
    """Manager personalizado para el modelo Usuario"""
    
    def create_user(self, email, password=None, **extra_fields):
        """Crea y guarda un usuario regular"""
        if not email:
            raise ValueError('El usuario debe tener un email')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Crea y guarda un superusuario"""
        extra_fields.setdefault('rol', 'superadmin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser debe tener is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser debe tener is_superuser=True')
        
        return self.create_user(email, password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    """
    Modelo de usuario personalizado
    Roles: superadmin, admin_area
    """
    id = models.AutoField(primary_key=True)
    
    ROLES = (
        ('superadmin', 'Super Administrador'),
        ('admin_area', 'Administrador de Área'),
    )
    
    email = models.EmailField(unique=True, max_length=255)
    nombre = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=150)
    rol = models.CharField(max_length=20, choices=ROLES)
    area = models.ForeignKey(
        'areas.Area',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='usuarios'
    )
    
    activo = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    ultimo_acceso = models.DateTimeField(null=True, blank=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    objects = UsuarioManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre', 'apellidos']
    
    class Meta:
        db_table = 'usuarios'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['apellidos', 'nombre']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    def get_full_name(self):
        """Retorna el nombre completo del usuario"""
        return f"{self.nombre} {self.apellidos}"
    
    def get_short_name(self):
        """Retorna el nombre del usuario"""
        return self.nombre
    
    def es_superadmin(self):
        """Verifica si el usuario es superadmin"""
        return self.rol == 'superadmin'
    
    def es_admin_area(self):
        """Verifica si el usuario es admin de área"""
        return self.rol == 'admin_area'
    
    def tiene_permiso_area(self, area_id):
        """Verifica si el usuario tiene acceso a un área específica"""
        if self.es_superadmin():
            return True
        return self.area_id == area_id if self.area_id else False
    
    def actualizar_ultimo_acceso(self):
        """Actualiza la fecha del último acceso"""
        self.ultimo_acceso = timezone.now()
        self.save(update_fields=['ultimo_acceso'])
"""
Configuración del admin de Django para autenticación
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(BaseUserAdmin):
    """Admin personalizado para Usuario"""
    
    list_display = ['email', 'nombre', 'apellidos', 'rol', 'area', 'activo', 'fecha_creacion']
    list_filter = ['rol', 'activo', 'fecha_creacion']
    search_fields = ['email', 'nombre', 'apellidos']
    ordering = ['-fecha_creacion']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Información Personal', {'fields': ('nombre', 'apellidos')}),
        ('Permisos', {'fields': ('rol', 'area', 'activo', 'is_staff', 'is_superuser')}),
        ('Fechas', {'fields': ('ultimo_acceso', 'fecha_creacion')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'nombre', 'apellidos', 'rol', 'area', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ['fecha_creacion', 'ultimo_acceso']
    filter_horizontal = ()
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('area')
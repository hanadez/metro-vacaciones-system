"""
Permisos personalizados para autenticación
"""

from rest_framework import permissions


class IsSuperAdmin(permissions.BasePermission):
    """
    Permiso que solo permite acceso a SuperAdmin
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.rol == 'superadmin'


class IsAdminArea(permissions.BasePermission):
    """
    Permiso que solo permite acceso a Admin de Área
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.rol == 'admin_area'


class IsSuperAdminOrAdminArea(permissions.BasePermission):
    """
    Permiso que permite acceso a SuperAdmin o Admin de Área
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.rol in ['superadmin', 'admin_area']
        )


class IsOwnerOrSuperAdmin(permissions.BasePermission):
    """
    Permiso que permite acceso al dueño del objeto o a SuperAdmin
    """
    
    def has_object_permission(self, request, view, obj):
        # SuperAdmin tiene acceso a todo
        if request.user.rol == 'superadmin':
            return True
        
        # Admin de área solo puede acceder a objetos de su área
        if hasattr(obj, 'area_id'):
            return obj.area_id == request.user.area_id
        
        # Si el objeto es un usuario, solo puede acceder a sí mismo
        if hasattr(obj, 'id') and hasattr(request.user, 'id'):
            return obj.id == request.user.id
        
        return False


class CanManageArea(permissions.BasePermission):
    """
    Permiso para gestionar objetos de un área específica
    """
    
    def has_object_permission(self, request, view, obj):
        # SuperAdmin puede gestionar todas las áreas
        if request.user.rol == 'superadmin':
            return True
        
        # Admin de área solo puede gestionar su propia área
        if request.user.rol == 'admin_area':
            if hasattr(obj, 'area'):
                return obj.area == request.user.area
            if hasattr(obj, 'area_id'):
                return obj.area_id == request.user.area_id
        
        return False
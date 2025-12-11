"""
URLs principales del proyecto
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Admin de Django
    path('admin/', admin.site.urls),
    
    # API REST
    path('api/auth/', include('apps.authentication.urls')),
    path('api/areas/', include('apps.areas.urls')),
    path('api/empleados/', include('apps.empleados.urls')),
    path('api/configuracion/', include('apps.configuracion.urls')),
    path('api/catalogos/', include('apps.catalogos.urls')),
    path('api/solicitudes/', include('apps.solicitudes.urls')),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
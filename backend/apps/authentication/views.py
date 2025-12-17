from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone

from .models import Usuario
from .serializers import (
    UsuarioSerializer,
    LoginSerializer,
    ChangePasswordSerializer,
    UsuarioCreateSerializer
)
from .permissions import IsSuperAdmin


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Vista de login que retorna tokens JWT y datos del usuario
    """
    serializer = LoginSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Actualizar último acceso
        user.ultimo_acceso = timezone.now()
        user.save(update_fields=['ultimo_acceso'])
        
        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        
        # Serializar datos del usuario
        user_data = UsuarioSerializer(user).data
        
        return Response({
            'user': user_data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Vista de logout (opcional, principalmente para blacklist de tokens)
    """
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({'detail': 'Sesión cerrada exitosamente.'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'detail': 'Token inválido.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    Obtener perfil del usuario autenticado
    """
    serializer = UsuarioSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """
    Cambiar contraseña del usuario autenticado
    """
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        serializer.save()
        return Response({'detail': 'Contraseña actualizada exitosamente.'}, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_last_access_view(request):
    """
    Actualizar último acceso del usuario
    """
    user = request.user
    user.ultimo_acceso = timezone.now()
    user.save(update_fields=['ultimo_acceso'])
    
    return Response({'detail': 'Último acceso actualizado.'}, status=status.HTTP_200_OK)


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de usuarios (solo SuperAdmin)
    """
    queryset = Usuario.objects.all()
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UsuarioCreateSerializer
        return UsuarioSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtrar por rol si se especifica
        rol = self.request.query_params.get('rol', None)
        if rol:
            queryset = queryset.filter(rol=rol)
        
        # Filtrar por área si se especifica
        area_id = self.request.query_params.get('area_id', None)
        if area_id:
            queryset = queryset.filter(area_id=area_id)
        
        return queryset.order_by('-fecha_creacion')
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activar usuario"""
        user = self.get_object()
        user.activo = True
        user.save()
        return Response({'detail': 'Usuario activado.'})
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Desactivar usuario"""
        user = self.get_object()
        user.activo = False
        user.save()
        return Response({'detail': 'Usuario desactivado.'})
    
    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """Resetear contraseña (genera una temporal)"""
        user = self.get_object()
        temp_password = Usuario.objects.make_random_password(length=12)
        user.set_password(temp_password)
        user.save()
        
        # En producción, enviar email con la contraseña temporal
        return Response({
            'detail': 'Contraseña reseteada.',
            'temp_password': temp_password  # Solo para desarrollo
        })
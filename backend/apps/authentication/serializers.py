"""
Serializers para autenticación
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Usuario"""
    
    area_nombre = serializers.CharField(source='area.nombre', read_only=True)
    
    class Meta:
        model = Usuario
        fields = [
            'id',
            'email',
            'nombre',
            'apellidos',
            'rol',
            'area_id',
            'area_nombre',
            'activo',
            'fecha_creacion',
            'ultimo_acceso',
        ]
        read_only_fields = ['id', 'fecha_creacion']


class LoginSerializer(serializers.Serializer):
    """Serializer para login"""
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # Autenticar usuario
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError(
                    'Las credenciales proporcionadas son incorrectas.',
                    code='authorization'
                )
            
            if not user.activo:
                raise serializers.ValidationError(
                    'Esta cuenta está desactivada.',
                    code='authorization'
                )
        else:
            raise serializers.ValidationError(
                'Debe proporcionar email y contraseña.',
                code='authorization'
            )
        
        attrs['user'] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer para cambiar contraseña"""
    
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('La contraseña actual es incorrecta.')
        return value
    
    def validate_new_password(self, value):
        # Validaciones de contraseña
        if len(value) < 8:
            raise serializers.ValidationError('La contraseña debe tener al menos 8 caracteres.')
        return value
    
    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class UsuarioCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear usuarios"""
    
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = Usuario
        fields = [
            'email',
            'password',
            'password_confirm',
            'nombre',
            'apellidos',
            'rol',
            'area_id',
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password': 'Las contraseñas no coinciden.'})
        
        # Validar rol según área
        if attrs['rol'] == 'admin_area' and not attrs.get('area_id'):
            raise serializers.ValidationError({'area_id': 'Admin de área debe tener un área asignada.'})
        
        if attrs['rol'] == 'superadmin' and attrs.get('area_id'):
            raise serializers.ValidationError({'area_id': 'SuperAdmin no debe tener área asignada.'})
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = Usuario.objects.create_user(
            password=password,
            **validated_data
        )
        return user
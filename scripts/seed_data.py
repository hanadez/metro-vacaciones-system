"""
Script para cargar datos iniciales en el sistema
Ejecutar: python manage.py shell < scripts/seed_data.py
"""

import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.areas.models import Area
from apps.configuracion.models import ConfigGlobal
from apps.catalogos.models import (
    TipoVacacion,
    TipoDiaEconomico,
    Requisito,
    Firmante
)
from django.db import transaction

Usuario = get_user_model()

def crear_datos_iniciales():
    """Crea todos los datos iniciales necesarios"""
    
    print("Iniciando carga de datos iniciales...")
    
    try:
        with transaction.atomic():
            # 1. Crear SuperAdmin
            crear_superadmin()
            
            # 2. Configuración Global
            crear_configuracion_global()
            
            # 3. Tipos de Vacaciones Globales
            crear_tipos_vacaciones_globales()
            
            # 4. Tipos de Días Económicos Globales
            crear_tipos_dias_economicos_globales()
            
            # 5. Requisitos Globales
            crear_requisitos_globales()
            
            # 6. Área de Ejemplo
            area_ejemplo = crear_area_ejemplo()
            
            # 7. Admin de Área de Ejemplo
            crear_admin_area_ejemplo(area_ejemplo)
            
            # 8. Firmantes de Ejemplo
            crear_firmantes_ejemplo(area_ejemplo)
            
            print("\nDatos iniciales cargados exitosamente!")
            print_resumen()
            
    except Exception as e:
        print(f"\nError al cargar datos: {str(e)}")
        raise


def crear_superadmin():
    """Crea el usuario SuperAdmin"""
    print("\n Creando SuperAdmin...")
    
    if Usuario.objects.filter(email='superadmin@metro.gob.mx').exists():
        print("  SuperAdmin ya existe, saltando...")
        return
    
    superadmin = Usuario.objects.create_superuser(
        email='superadmin@metro.gob.mx',
        password='Admin123!',  # CAMBIAR EN PRODUCCIÓN
        nombre='Super',
        apellidos='Administrador',
        rol='superadmin'
    )
    print(f"   ✓ SuperAdmin creado: {superadmin.email}")


def crear_configuracion_global():
    """Crea configuraciones globales"""
    print("\n Creando Configuración Global...")
    
    configs = [
        {
            'clave': 'tabla_antiguedad',
            'valor': [
                {'años_min': 0, 'años_max': 1, 'dias': 6},
                {'años_min': 1, 'años_max': 3, 'dias': 8},
                {'años_min': 3, 'años_max': 5, 'dias': 10},
                {'años_min': 5, 'años_max': 10, 'dias': 12},
                {'años_min': 10, 'años_max': 15, 'dias': 14},
                {'años_min': 15, 'años_max': 999, 'dias': 16},
            ],
            'descripcion': 'Tabla de días de vacaciones según antigüedad'
        },
        {
            'clave': 'dias_anticipacion_minimo',
            'valor': {'dias': 30},
            'descripcion': 'Días mínimos de anticipación para solicitar vacaciones'
        },
        {
            'clave': 'meses_para_primera_solicitud',
            'valor': {'meses': 6},
            'descripcion': 'Meses que debe cumplir un empleado antes de su primera solicitud'
        },
        {
            'clave': 'dias_acumulables_max',
            'valor': {'dias': 24},
            'descripcion': 'Máximo de días acumulables de vacaciones'
        },
    ]
    
    for config_data in configs:
        config, created = ConfigGlobal.objects.update_or_create(
            clave=config_data['clave'],
            defaults={
                'valor': config_data['valor'],
                'descripcion': config_data['descripcion']
            }
        )
        status = "✓ Creado" if created else "↻ Actualizado"
        print(f"   {status}: {config.clave}")


def crear_tipos_vacaciones_globales():
    """Crea tipos de vacaciones globales"""
    print("\n Creando Tipos de Vacaciones Globales...")
    
    tipos = [
        {
            'nombre': 'Vacaciones Regulares',
            'codigo': 'VAC_REG',
            'descripcion': 'Vacaciones regulares del periodo correspondiente',
            'requiere_documentos': False,
            'orden': 1
        },
        {
            'nombre': 'Días a Cuenta',
            'codigo': 'VAC_CUENTA',
            'descripcion': 'Días adelantados del siguiente periodo',
            'requiere_documentos': True,
            'orden': 2
        },
        {
            'nombre': 'Días Reprogramados',
            'codigo': 'VAC_REPROG',
            'descripcion': 'Días que fueron reprogramados de periodos anteriores',
            'requiere_documentos': False,
            'orden': 3
        },
        {
            'nombre': 'Adelantadas (Requiere Oficio)',
            'codigo': 'VAC_ADELANT',
            'descripcion': 'Vacaciones adelantadas por necesidad especial',
            'requiere_documentos': True,
            'orden': 4
        },
    ]
    
    for tipo_data in tipos:
        tipo, created = TipoVacacion.objects.update_or_create(
            codigo=tipo_data['codigo'],
            area_id=None,  # Global
            defaults={
                'nombre': tipo_data['nombre'],
                'descripcion': tipo_data['descripcion'],
                'requiere_documentos': tipo_data['requiere_documentos'],
                'orden': tipo_data['orden'],
                'activo': True
            }
        )
        status = "✓ Creado" if created else "↻ Actualizado"
        print(f"   {status}: {tipo.nombre}")


def crear_tipos_dias_economicos_globales():
    """Crea tipos de días económicos globales"""
    print("\n Creando Tipos de Días Económicos Globales...")
    
    # Con goce de sueldo
    con_goce = [
        {
            'nombre': 'Defunción de Familiar',
            'codigo': 'DE_DEFUNCION',
            'categoria': 'con_goce',
            'descripcion': 'Por fallecimiento de familiar directo',
            'texto_explicativo': 'Padre, madre, cónyuge, hijo(a), hermano(a)',
            'limite_dias': 3,
            'orden': 1
        },
        {
            'nombre': 'Titulación',
            'codigo': 'DE_TITULACION',
            'categoria': 'con_goce',
            'descripcion': 'Por titulación profesional',
            'texto_explicativo': 'Nivel técnico, licenciatura o posgrado',
            'limite_dias': 1,
            'orden': 2
        },
        {
            'nombre': 'Matrimonio',
            'codigo': 'DE_MATRIMONIO',
            'categoria': 'con_goce',
            'descripcion': 'Por contraer matrimonio',
            'texto_explicativo': 'Solo una vez por matrimonio',
            'limite_dias': 3,
            'orden': 3
        },
        {
            'nombre': 'Maternidad',
            'codigo': 'DE_MATERNIDAD',
            'categoria': 'con_goce',
            'descripcion': 'Permiso de maternidad',
            'texto_explicativo': 'Según legislación aplicable',
            'limite_dias': 84,  # 12 semanas
            'orden': 4
        },
        {
            'nombre': 'Paternidad',
            'codigo': 'DE_PATERNIDAD',
            'categoria': 'con_goce',
            'descripcion': 'Permiso de paternidad',
            'texto_explicativo': 'Por nacimiento o adopción',
            'limite_dias': 5,
            'orden': 5
        },
        {
            'nombre': 'Preescolaridad',
            'codigo': 'DE_PREESCOLAR',
            'categoria': 'con_goce',
            'descripcion': 'Para atención de hijos en edad preescolar',
            'texto_explicativo': 'Eventos escolares importantes',
            'limite_dias': 2,
            'orden': 6
        },
    ]
    
    # Sin goce de sueldo
    sin_goce = [
        {
            'nombre': 'Trámite Personal',
            'codigo': 'DE_TRAMITE',
            'categoria': 'sin_goce',
            'descripcion': 'Por trámites personales',
            'texto_explicativo': 'Asuntos personales diversos',
            'limite_dias': None,  # Sin límite específico
            'orden': 10
        },
        {
            'nombre': 'Permiso Especial',
            'codigo': 'DE_ESPECIAL',
            'categoria': 'sin_goce',
            'descripcion': 'Permiso especial sin goce de sueldo',
            'texto_explicativo': 'Requiere autorización especial',
            'limite_dias': None,
            'orden': 11
        },
    ]
    
    tipos = con_goce + sin_goce
    
    for tipo_data in tipos:
        tipo, created = TipoDiaEconomico.objects.update_or_create(
            codigo=tipo_data['codigo'],
            area_id=None,  # Global
            defaults={
                'nombre': tipo_data['nombre'],
                'categoria': tipo_data['categoria'],
                'descripcion': tipo_data['descripcion'],
                'texto_explicativo': tipo_data['texto_explicativo'],
                'limite_dias': tipo_data['limite_dias'],
                'orden': tipo_data['orden'],
                'activo': True
            }
        )
        status = "✓ Creado" if created else "↻ Actualizado"
        categoria_text = "Con goce" if tipo.categoria == 'con_goce' else "Sin goce"
        print(f"   {status}: {tipo.nombre} ({categoria_text})")


def crear_requisitos_globales():
    """Crea requisitos globales"""
    print("\n📋 Creando Requisitos Globales...")
    
    requisitos = [
        {
            'nombre': 'Acta de Defunción',
            'codigo': 'REQ_ACTA_DEF',
            'descripcion': 'Copia del acta de defunción',
            'obligatorio': True
        },
        {
            'nombre': 'Acta de Nacimiento',
            'codigo': 'REQ_ACTA_NAC',
            'descripcion': 'Copia del acta de nacimiento',
            'obligatorio': True
        },
        {
            'nombre': 'Título Profesional',
            'codigo': 'REQ_TITULO',
            'descripcion': 'Copia del título profesional',
            'obligatorio': True
        },
        {
            'nombre': 'Acta de Matrimonio',
            'codigo': 'REQ_ACTA_MAT',
            'descripcion': 'Copia del acta de matrimonio',
            'obligatorio': True
        },
        {
            'nombre': 'Oficio de Autorización',
            'codigo': 'REQ_OFICIO',
            'descripcion': 'Oficio de autorización firmado',
            'obligatorio': True
        },
        {
            'nombre': 'Comprobante de Trámite',
            'codigo': 'REQ_COMPROBANTE',
            'descripcion': 'Documento que justifique el trámite',
            'obligatorio': False
        },
    ]
    
    requisitos_creados = []
    for req_data in requisitos:
        req, created = Requisito.objects.update_or_create(
            codigo=req_data['codigo'],
            area_id=None,  # Global
            defaults={
                'nombre': req_data['nombre'],
                'descripcion': req_data['descripcion'],
                'obligatorio': req_data['obligatorio'],
                'activo': True
            }
        )
        requisitos_creados.append(req)
        status = "✓ Creado" if created else "↻ Actualizado"
        print(f"   {status}: {req.nombre}")
    
    # Asociar requisitos con tipos de días económicos
    print("\n   Asociando requisitos con tipos...")
    
    asociaciones = {
        'DE_DEFUNCION': ['REQ_ACTA_DEF'],
        'DE_TITULACION': ['REQ_TITULO'],
        'DE_MATRIMONIO': ['REQ_ACTA_MAT'],
        'DE_MATERNIDAD': ['REQ_ACTA_NAC'],
        'DE_PATERNIDAD': ['REQ_ACTA_NAC'],
        'VAC_ADELANT': ['REQ_OFICIO'],
        'VAC_CUENTA': ['REQ_OFICIO'],
    }
    
    for tipo_codigo, req_codigos in asociaciones.items():
        # Buscar en tipos de vacaciones
        tipo_vac = TipoVacacion.objects.filter(codigo=tipo_codigo, area_id=None).first()
        if tipo_vac:
            reqs = Requisito.objects.filter(codigo__in=req_codigos, area_id=None)
            tipo_vac.requisitos.set(reqs)
            print(f"   → {tipo_vac.nombre}: {len(reqs)} requisitos")
        
        # Buscar en tipos de días económicos
        tipo_dia = TipoDiaEconomico.objects.filter(codigo=tipo_codigo, area_id=None).first()
        if tipo_dia:
            reqs = Requisito.objects.filter(codigo__in=req_codigos, area_id=None)
            tipo_dia.requisitos.set(reqs)
            print(f"   → {tipo_dia.nombre}: {len(reqs)} requisitos")


def crear_area_ejemplo():
    """Crea un área de ejemplo"""
    print("\n Creando Área de Ejemplo...")
    
    area, created = Area.objects.update_or_create(
        codigo='OPER_L1',
        defaults={
            'nombre': 'Operación Línea 1',
            'descripcion': 'Área de operación de la Línea 1 del Metro',
            'activo': True,
            'configuracion': {
                'prorroga_activa': True,
                'prorroga_dias': 30,
                'dias_anticipacion': 15,
            }
        }
    )
    status = "✓ Creado" if created else "↻ Actualizado"
    print(f"   {status}: {area.nombre}")
    return area


def crear_admin_area_ejemplo(area):
    """Crea un administrador para el área de ejemplo"""
    print("\n Creando Administrador de Área...")
    
    if Usuario.objects.filter(email='admin.l1@metro.gob.mx').exists():
        print("    Admin de área ya existe, saltando...")
        return
    
    admin = Usuario.objects.create_user(
        email='admin.l1@metro.gob.mx',
        password='Admin123!',  # CAMBIAR EN PRODUCCIÓN
        nombre='Juan',
        apellidos='Pérez García',
        rol='admin_area',
        area=area
    )
    print(f"   ✓ Admin creado: {admin.email} (Área: {area.nombre})")


def crear_firmantes_ejemplo(area):
    """Crea firmantes de ejemplo para el área"""
    print("\n Creando Firmantes de Ejemplo...")
    
    firmantes = [
        {
            'rol': 'encargado_area',
            'nombre_completo': 'María Teresa González López',
            'cargo': 'Jefa de Operación Línea 1',
            'orden': 2
        },
        {
            'rol': 'jefe_encargado',
            'nombre_completo': 'Carlos Alberto Ramírez Sánchez',
            'cargo': 'Director de Operaciones',
            'orden': 3
        },
    ]
    
    for firmante_data in firmantes:
        firmante, created = Firmante.objects.update_or_create(
            area=area,
            rol=firmante_data['rol'],
            defaults={
                'nombre_completo': firmante_data['nombre_completo'],
                'cargo': firmante_data['cargo'],
                'orden': firmante_data['orden'],
                'activo': True
            }
        )
        status = "✓ Creado" if created else "↻ Actualizado"
        print(f"   {status}: {firmante.nombre_completo} ({firmante.cargo})")


def print_resumen():
    """Imprime resumen de datos cargados"""
    print("\n" + "="*60)
    print("RESUMEN DE DATOS INICIALES")
    print("="*60)
    
    print(f"\n Usuarios: {Usuario.objects.count()}")
    print(f"   - SuperAdmin: {Usuario.objects.filter(rol='superadmin').count()}")
    print(f"   - Admin Área: {Usuario.objects.filter(rol='admin_area').count()}")
    
    print(f"\n Áreas: {Area.objects.count()}")
    
    print(f"\n Configuración Global: {ConfigGlobal.objects.count()} items")
    
    print(f"\n  Tipos de Vacaciones: {TipoVacacion.objects.filter(area_id=None).count()}")
    
    print(f"\n Tipos de Días Económicos: {TipoDiaEconomico.objects.filter(area_id=None).count()}")
    print(f"   - Con goce: {TipoDiaEconomico.objects.filter(area_id=None, categoria='con_goce').count()}")
    print(f"   - Sin goce: {TipoDiaEconomico.objects.filter(area_id=None, categoria='sin_goce').count()}")
    
    print(f"\nRequisitos: {Requisito.objects.filter(area_id=None).count()}")
    
    print(f"\n Firmantes: {Firmante.objects.count()}")
    
    print("\n" + "="*60)
    print("CREDENCIALES DE ACCESO")
    print("="*60)
    print("\nSuperAdmin:")
    print("   Email: superadmin@metro.gob.mx")
    print("   Password: Admin123!")
    
    print("\nAdmin de Área (Línea 1):")
    print("   Email: admin.l1@metro.gob.mx")
    print("   Password: Admin123!")
    
    print("\n IMPORTANTE: Cambiar todas las contraseñas en producción!")
    print("="*60 + "\n")


if __name__ == '__main__':
    crear_datos_iniciales()
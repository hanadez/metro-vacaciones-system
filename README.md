# Sistema de Gestión de Días Económicos y Vacaciones - Metro

Sistema web para la gestión de solicitudes de vacaciones y días económicos de empleados del Sistema de Transporte Colectivo Metro.

## 📋 Requisitos Previos

### Backend
- Python 3.10 o superior
- PostgreSQL 14 o superior
- pip (gestor de paquetes de Python)

### Frontend
- Node.js 18 o superior
- npm o yarn

## 🛠️ Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/hanadez/metro-vacaciones-system.git
cd metro-vacaciones-system
```

### 2. Configurar Backend (Django)

#### 2.1 Crear entorno virtual

```bash
cd backend
python -m venv venv

# Activar entorno virtual
# En Linux/Mac:
source venv/bin/activate
# En Windows:
venv\Scripts\activate
```

#### 2.2 Instalar dependencias

```bash
pip install -r requirements.txt
```

#### 2.3 Configurar base de datos

Crear base de datos MySQL:

```sql
CREATE DATABASE metro_vacaciones;
CREATE USER 'metro_user'@'%' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON metro_vacaciones.* TO 'metro_user'@'%';
FLUSH PRIVILEGES;
```

#### 2.4 Configurar variables de entorno

Crear archivo `.env` en la carpeta `backend/`:

```env
# Django
SECRET_KEY=tu-secret-key-muy-segura-y-aleatoria
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Base de datos
DB_NAME=metro_vacaciones
DB_USER=metro_user
DB_PASSWORD=tu_password_seguro
DB_HOST=localhost
DB_PORT=3306

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### 2.5 Ejecutar migraciones

```bash
# Usar migraciones de Django
python manage.py makemigrations
python manage.py migrate
```

#### 2.6 Crear superusuario

```bash
python manage.py createsuperuser
# Email: superadmin@metro.gob.mx
# Password: [tu contraseña segura]
```

#### 2.7 Cargar datos iniciales

```bash
python manage.py loaddata initial_data
```

#### 2.8 Ejecutar servidor de desarrollo

```bash
python manage.py runserver
```

El backend estará disponible en: `http://localhost:8000`

### 3. Configurar Frontend (React)

#### 3.1 Instalar dependencias

```bash
cd frontend
npm install
```

#### 3.2 Configurar variables de entorno

Crear archivo `.env` en la carpeta `frontend/`:

```env
VITE_API_URL=http://localhost:8000/api
```

#### 3.3 Ejecutar servidor de desarrollo

```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## 📦 Estructura del Proyecto

```
metro-vacaciones-system/
├── backend/              # Django REST API
│   ├── apps/
│   │   ├── authentication/
│   │   ├── areas/
│   │   ├── empleados/
│   │   ├── configuracion/
│   │   ├── catalogos/
│   │   ├── solicitudes/
│   │   ├── calculos/
│   │   ├── pdf_generation/
│   │   └── auditoria/
│   ├── config/          # Configuración Django
│   └── manage.py
│
├── frontend/            # React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── types/
│   └── package.json
│
└── docs/               # Documentación
```

## 🔐 Usuarios por Defecto

### SuperAdmin
- **Email**: superadmin@metro.gob.mx
- **Password**: [configurado durante createsuperuser]
- **Permisos**: Configuración global, gestión de áreas

## 🎯 Uso Básico

### Como SuperAdmin

1. **Configurar tabla de antigüedad**
   - Ir a Configuración → Global
   - Editar "Tabla de Antigüedad"
   - Definir rangos de años y días correspondientes

2. **Crear áreas**
   - Ir a Áreas → Nueva Área
   - Ingresar nombre, código y descripción
   - Configurar parámetros específicos del área

3. **Crear administradores de área**
   - Ir a Usuarios → Nuevo Usuario
   - Seleccionar rol "Administrador de Área"
   - Asignar área correspondiente

### Como Administrador de Área

1. **Registrar empleados**
   - Ir a Empleados → Nuevo Empleado
   - Ingresar datos completos
   - Para personal de taquillas, activar opción y configurar turnos

2. **Configurar firmantes**
   - Ir a Configuración → Firmantes
   - Agregar: Encargado del Área, Jefe del Encargado
   - Los nombres aparecerán en los PDFs

3. **Crear solicitud de vacaciones**
   - Ir a Solicitudes → Nueva Solicitud
   - Seleccionar empleado
   - Elegir tipo: Vacaciones
   - Seleccionar periodo y tipo de vacación
   - El sistema calcula automáticamente los días disponibles
   - Ingresar fechas y observaciones
   - Generar PDF

4. **Crear solicitud de día económico**
   - Similar a vacaciones, pero seleccionar tipo de día económico
   - El sistema valida límites según configuración

## 📄 Generación de PDFs

El sistema genera PDFs con:
- **Formato oficial** con doble copia en una sola hoja
- **Copia Usuario**: mitad superior
- **Copia Área**: mitad inferior (con espacio para sello de RH)
- **Espacios de firma** en blanco para firma manuscrita
- **Nombres y cargos** de los firmantes impresos
- **Todos los datos** de la solicitud y del empleado

Los PDFs se guardan en: `backend/media/pdfs/YYYY/MM/FOLIO.pdf`

## ⚙️ Configuración Dinámica

Todo es configurable desde la interfaz:

### Configuración Global (SuperAdmin)
- Tabla de antigüedad
- Días mínimos de anticipación
- Meses requeridos para primera solicitud
- Máximo de días acumulables

### Configuración por Área
- Prórrogas (activar/desactivar, duración)
- Días de anticipación específicos
- Tipos de vacaciones personalizados
- Tipos de días económicos personalizados
- Requisitos por tipo
- Firmantes (3 roles)
- Reglas especiales (taquillas, etc.)

## 🔍 API Endpoints

### Autenticación
```
POST   /api/auth/login/
POST   /api/auth/token/refresh/
GET    /api/auth/profile/
POST   /api/auth/change-password/
```

### Áreas
```
GET    /api/areas/
POST   /api/areas/
GET    /api/areas/{id}/
PUT    /api/areas/{id}/
DELETE /api/areas/{id}/
```

### Empleados
```
GET    /api/empleados/
POST   /api/empleados/
GET    /api/empleados/{id}/
PUT    /api/empleados/{id}/
GET    /api/empleados/{id}/saldos/
```

### Solicitudes
```
GET    /api/solicitudes/
POST   /api/solicitudes/
GET    /api/solicitudes/{id}/
PUT    /api/solicitudes/{id}/
GET    /api/solicitudes/{id}/pdf/
POST   /api/solicitudes/{id}/generar-pdf/
```

### Configuración
```
GET    /api/configuracion/global/
PUT    /api/configuracion/global/{clave}/
GET    /api/configuracion/area/{area_id}/
```

Documentación completa: `http://localhost:8000/api/docs/`

## 🧪 Testing

### Backend
```bash
cd backend
pytest
pytest --cov=apps
```

### Frontend
```bash
cd frontend
npm run test
```

## 🚀 Despliegue en Producción

### Backend (Django)

1. **Configurar variables de entorno de producción**

```env
DEBUG=False
ALLOWED_HOSTS=tu-dominio.com
SECRET_KEY=generar-nueva-key-super-segura
```

2. **Recolectar archivos estáticos**

```bash
python manage.py collectstatic
```

3. **Ejecutar con Gunicorn**

```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

4. **Configurar Nginx como proxy reverso**

### Frontend (React)

1. **Build de producción**

```bash
npm run build
```

2. **Servir con Nginx**

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
    }
}
```

## 🐳 Docker (Opcional)

```bash
docker-compose up -d
```

## 📝 Notas Importantes

1. **Seguridad**:
   - Cambiar SECRET_KEY en producción
   - Usar contraseñas fuertes
   - Configurar HTTPS
   - Limitar CORS a dominios específicos

2. **Backups**:
   - Programar backups regulares de PostgreSQL
   - Respaldar carpeta `media/pdfs/`

3. **Rendimiento**:
   - Usar Redis para caché en producción
   - Configurar CDN para archivos estáticos
   - Optimizar queries con select_related

4. **Mantenimiento**:
   - Revisar logs periódicamente
   - Actualizar dependencias regularmente
   - Monitorear espacio en disco (PDFs)

## 🆘 Soporte y Problemas Comunes

### Error: No se puede conectar a la base de datos
- Verificar que PostgreSQL esté corriendo
- Revisar credenciales en `.env`
- Verificar que la base de datos existe

### Error: CORS
- Verificar CORS_ALLOWED_ORIGINS en settings.py
- Asegurar que el frontend corre en puerto permitido

### Error: PDF no se genera
- Verificar instalación de WeasyPrint
- Verificar permisos de escritura en `media/pdfs/`
- Revisar logs en `backend/logs/django.log`

## 📚 Documentación Adicional

- [API Documentation](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [User Guide](docs/USER_GUIDE.md)

## 👥 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto es propiedad del Sistema de Transporte Colectivo Metro.

## ✨ Créditos

Desarrollado para el Sistema de Transporte Colectivo Metro
Versión 1.0.0 - 2024
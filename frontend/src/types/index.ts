/**
 * Tipos TypeScript para el sistema
 */

// ============================================================================
// USUARIOS Y AUTENTICACIÓN
// ============================================================================

export type RolUsuario = 'superadmin' | 'admin_area';

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellidos: string;
  rol: RolUsuario;
  area_id?: number;
  area?: Area;
  activo: boolean;
  fecha_creacion: string;
  ultimo_acceso?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: Usuario;
  tokens: AuthTokens;
}

// ============================================================================
// ÁREAS
// ============================================================================

export interface Area {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  activo: boolean;
  configuracion: ConfiguracionArea;
  fecha_creacion: string;
}

export interface ConfiguracionArea {
  prorroga_activa?: boolean;
  prorroga_dias?: number;
  dias_anticipacion?: number;
  [key: string]: any;
}

// ============================================================================
// EMPLEADOS
// ============================================================================

export interface Empleado {
  id: number;
  area_id: number;
  area?: Area;
  numero_expediente: string;
  nombre: string;
  apellidos: string;
  fecha_ingreso: string;
  categoria_laboral?: string;
  linea_metro?: string;
  turno?: string;
  es_taquilla: boolean;
  activo: boolean;
  calendario_descansos?: CalendarioDescansos;
}

export interface CalendarioDescansos {
  dias_rolados: string[];
  turno: string;
  linea: string;
}

// ============================================================================
// CONFIGURACIÓN GLOBAL
// ============================================================================

export interface ConfigGlobal {
  id: number;
  clave: string;
  valor: any;
  descripcion?: string;
  fecha_actualizacion: string;
}

export interface TablaAntiguedad {
  años_min: number;
  años_max: number;
  dias: number;
}

// ============================================================================
// CATÁLOGOS
// ============================================================================

export interface TipoVacacion {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  requiere_documentos: boolean;
  area_id?: number;
  activo: boolean;
  requisitos?: Requisito[];
}

export interface TipoDiaEconomico {
  id: number;
  nombre: string;
  codigo: string;
  categoria: 'con_goce' | 'sin_goce';
  descripcion?: string;
  texto_explicativo?: string;
  limite_dias?: number;
  area_id?: number;
  activo: boolean;
  requisitos?: Requisito[];
}

export interface Requisito {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  obligatorio: boolean;
  area_id?: number;
  activo: boolean;
}

export interface Firmante {
  id: number;
  area_id: number;
  rol: 'interesado' | 'encargado_area' | 'jefe_encargado';
  nombre_completo: string;
  cargo: string;
  orden: number;
  activo: boolean;
}

// ============================================================================
// SOLICITUDES
// ============================================================================

export type TipoSolicitud = 'vacaciones' | 'dia_economico';
export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada';

export interface Solicitud {
  id: string;
  folio: string;
  empleado_id: number;
  empleado?: Empleado;
  area_id: number;
  area?: Area;
  tipo_solicitud: TipoSolicitud;
  tipo_vacacion_id?: number;
  tipo_vacacion?: TipoVacacion;
  tipo_dia_economico_id?: number;
  tipo_dia_economico?: TipoDiaEconomico;
  fecha_solicitud: string;
  fecha_inicio: string;
  fecha_reanudar: string;
  dias_habiles: number;
  periodo?: string;
  observaciones?: string;
  estado: EstadoSolicitud;
  pdf_path?: string;
  pdf_generado_en?: string;
  tiene_conflicto_descanso: boolean;
  mensaje_warning?: string;
  fecha_creacion: string;
  creado_por?: Usuario;
}

export interface SolicitudFormData {
  empleado_id: number;
  tipo_solicitud: TipoSolicitud;
  tipo_vacacion_id?: number;
  tipo_dia_economico_id?: number;
  fecha_inicio: string;
  dias_habiles: number;
  observaciones?: string;
}

// ============================================================================
// SALDOS
// ============================================================================

export interface SaldoVacaciones {
  id: number;
  empleado_id: number;
  empleado?: Empleado;
  periodo: string;
  dias_otorgados: number;
  dias_utilizados: number;
  dias_disponibles: number;
  fecha_inicio_periodo: string;
  fecha_fin_periodo: string;
}

export interface HistorialSaldo {
  id: number;
  empleado_id: number;
  periodo: string;
  tipo_movimiento: 'otorgamiento' | 'uso' | 'ajuste' | 'cancelacion';
  dias_antes: number;
  dias_movimiento: number;
  dias_despues: number;
  solicitud_id?: string;
  descripcion?: string;
  fecha_movimiento: string;
}

// ============================================================================
// REGLAS
// ============================================================================

export interface ReglaArea {
  id: number;
  area_id: number;
  tipo_regla: string;
  configuracion: any;
  activo: boolean;
}

// ============================================================================
// RESPONSES DE API
// ============================================================================

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface ApiError {
  detail?: string;
  [key: string]: any;
}

// ============================================================================
// FORMULARIOS
// ============================================================================

export interface EmpleadoFormData {
  area_id: number;
  numero_expediente: string;
  nombre: string;
  apellidos: string;
  fecha_ingreso: string;
  categoria_laboral?: string;
  linea_metro?: string;
  turno?: string;
  es_taquilla: boolean;
  calendario_descansos?: CalendarioDescansos;
}

export interface AreaFormData {
  nombre: string;
  codigo: string;
  descripcion?: string;
  activo: boolean;
}

// ============================================================================
// DASHBOARD
// ============================================================================

export interface DashboardStats {
  total_empleados: number;
  total_solicitudes: number;
  solicitudes_pendientes: number;
  solicitudes_aprobadas: number;
  total_areas?: number;
}
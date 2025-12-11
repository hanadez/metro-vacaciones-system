import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  Calendar, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  BarChart,
  Plus
} from 'lucide-react';
import axios from 'axios';

interface StatsArea {
  solicitudes_pendientes: number;
  solicitudes_aprobadas_mes: number;
  solicitudes_rechazadas_mes: number;
  empleados_activos: number;
  empleados_con_vacaciones_pendientes: number;
  promedio_dias_disponibles: number;
  total_dias_utilizados_mes: number;
}

interface SolicitudPendiente {
  id: number;
  numero_folio: string;
  empleado_nombre: string;
  empleado_apellidos: string;
  tipo_permiso: string;
  fecha_inicio: string;
  fecha_fin: string;
  dias_solicitados: number;
  fecha_creacion: string;
}

interface EmpleadoAlerta {
  id: number;
  nombre: string;
  apellidos: string;
  numero_expediente: string;
  dias_disponibles: number;
  dias_por_vencer: number;
  fecha_vencimiento: string;
}

const AdminAreaDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsArea | null>(null);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState<SolicitudPendiente[]>([]);
  const [empleadosAlerta, setEmpleadosAlerta] = useState<EmpleadoAlerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, pendientesRes, alertasRes] = await Promise.all([
        axios.get('/api/dashboard/admin-area/stats/'),
        axios.get('/api/solicitudes/?estado=pendiente&limit=5'),
        axios.get('/api/empleados/alertas-vacaciones/')
      ]);

      setStats(statsRes.data);
      setSolicitudesPendientes(pendientesRes.data.results || []);
      setEmpleadosAlerta(alertasRes.data.results || []);
    } catch (err) {
      console.error('Error al cargar dashboard:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const aprobarSolicitud = async (id: number) => {
    if (!confirm('¿Estás seguro de aprobar esta solicitud?')) return;

    try {
      await axios.patch(`/api/solicitudes/${id}/`, { estado: 'aprobada' });
      alert('Solicitud aprobada exitosamente');
      cargarDashboard();
    } catch (err) {
      console.error('Error al aprobar:', err);
      alert('Error al aprobar la solicitud');
    }
  };

  const rechazarSolicitud = async (id: number) => {
    const motivo = prompt('Motivo del rechazo:');
    if (!motivo) return;

    try {
      await axios.patch(`/api/solicitudes/${id}/`, { 
        estado: 'rechazada',
        observaciones: motivo 
      });
      alert('Solicitud rechazada');
      cargarDashboard();
    } catch (err) {
      console.error('Error al rechazar:', err);
      alert('Error al rechazar la solicitud');
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Panel de Administración
          </h1>
          <p className="text-gray-600 mt-1">
            Área: {user?.area?.nombre || 'Sin área asignada'}
          </p>
        </div>
        <Button 
          onClick={() => navigate('/solicitudes/nueva')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Solicitud
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Solicitudes Pendientes
              </CardTitle>
              <Clock className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {stats.solicitudes_pendientes}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Requieren tu atención
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Aprobadas (Este Mes)
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.solicitudes_aprobadas_mes}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total_dias_utilizados_mes} días totales
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Empleados Activos
              </CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats.empleados_activos}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                En tu área
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Promedio Días Disponibles
              </CardTitle>
              <Calendar className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {stats.promedio_dias_disponibles.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Por empleado
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solicitudes Pendientes */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-yellow-600" />
                  Solicitudes Pendientes
                </CardTitle>
                <CardDescription>
                  Requieren aprobación o rechazo
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/solicitudes?estado=pendiente')}
              >
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {solicitudesPendientes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay solicitudes pendientes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {solicitudesPendientes.map((solicitud) => (
                  <div
                    key={solicitud.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {solicitud.numero_folio}
                        </p>
                        <p className="text-sm text-gray-600">
                          {solicitud.empleado_nombre} {solicitud.empleado_apellidos}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {solicitud.tipo_permiso} - {solicitud.dias_solicitados} días
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatearFecha(solicitud.fecha_inicio)} al {formatearFecha(solicitud.fecha_fin)}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatearFecha(solicitud.fecha_creacion)}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => aprobarSolicitud(solicitud.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => rechazarSolicitud(solicitud.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rechazar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/solicitudes/${solicitud.id}`)}
                      >
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas de Empleados */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                  Empleados con Días por Vencer
                </CardTitle>
                <CardDescription>
                  Días de vacaciones próximos a vencer
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {empleadosAlerta.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay alertas de vencimiento</p>
              </div>
            ) : (
              <div className="space-y-3">
                {empleadosAlerta.map((empleado) => (
                  <div
                    key={empleado.id}
                    className="border border-orange-200 bg-orange-50 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {empleado.nombre} {empleado.apellidos}
                        </p>
                        <p className="text-xs text-gray-600">
                          Exp: {empleado.numero_expediente}
                        </p>
                        <p className="text-sm text-orange-700 font-medium mt-1">
                          {empleado.dias_por_vencer} días vencen el {formatearFecha(empleado.fecha_vencimiento)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/empleados/${empleado.id}`)}
                      >
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
          onClick={() => navigate('/solicitudes/nueva')}
        >
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              <FileText className="w-5 h-5 mr-2" />
              Nueva Solicitud
            </CardTitle>
          </CardHeader>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-green-500"
          onClick={() => navigate('/solicitudes')}
        >
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <BarChart className="w-5 h-5 mr-2" />
              Ver Solicitudes
            </CardTitle>
          </CardHeader>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-purple-500"
          onClick={() => navigate('/empleados')}
        >
          <CardHeader>
            <CardTitle className="flex items-center text-purple-700">
              <Users className="w-5 h-5 mr-2" />
              Empleados
            </CardTitle>
          </CardHeader>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-orange-500"
          onClick={() => navigate('/reportes')}
        >
          <CardHeader>
            <CardTitle className="flex items-center text-orange-700">
              <TrendingUp className="w-5 h-5 mr-2" />
              Reportes
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default AdminAreaDashboard;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Alert } from '../../components/common/Alert';
import { solicitudesService } from '../../services/solicitudesService';
import { useLocation } from 'react-router-dom';
import { SolicitudForm } from '../../components/forms/SolicitudForm';
import { empleadosService } from '../../services/empleadosService';
import { configuracionService } from '../../services/configuracionService';
import type { Empleado, TipoVacacion, TipoDiaEconomico } from '../../types';

export const CrearSolicitud: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [tiposVacaciones, setTiposVacaciones] = useState<TipoVacacion[]>([]);
  const [tiposDiasEconomicos, setTiposDiasEconomicos] = useState<TipoDiaEconomico[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [empRes, vacRes, diasRes] = await Promise.all([
        empleadosService.getAll(),
        configuracionService.getTiposVacaciones(),
        configuracionService.getTiposDiasEconomicos(),
      ]);
      setEmpleados(empRes.data);
      setTiposVacaciones(vacRes.data);
      setTiposDiasEconomicos(diasRes.data);
    } catch (err: any) {
      setError('Error al cargar datos iniciales');
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      await solicitudesService.create(data);
      navigate('/solicitudes');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al crear solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Obtener empleado_id de query params si existe
  const queryParams = new URLSearchParams(location.search);
  const empleadoIdParam = queryParams.get('empleado');

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Solicitud</h1>
          <p className="text-gray-600 mt-1">
            Crear solicitud de vacaciones o día económico
          </p>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <SolicitudForm
            empleados={empleados}
            tiposVacaciones={tiposVacaciones}
            tiposDiasEconomicos={tiposDiasEconomicos}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/solicitudes')}
            empleadoIdInicial={empleadoIdParam ? parseInt(empleadoIdParam) : undefined}
          />
        </div>
      </div>
    </MainLayout>
  );
};
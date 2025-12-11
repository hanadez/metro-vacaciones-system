import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { Loading } from '../../components/common/Loading';
import { Alert } from '../../components/common/Alert';
import { Select } from '../../components/common/Select';
import { solicitudesService } from '../../services/solicitudesService';
import type { Solicitud } from '../../types';

export const ListaSolicitudes: React.FC = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');

  useEffect(() => {
    loadSolicitudes();
  }, [filtroEstado, filtroTipo]);

  const loadSolicitudes = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filtroEstado) params.estado = filtroEstado;
      if (filtroTipo) params.tipo_solicitud = filtroTipo;

      const response = await solicitudesService.getAll(params);
      setSolicitudes(response.data.results || response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (id: string) => {
    try {
      const response = await solicitudesService.getPDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `solicitud-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setError('Error al descargar PDF');
    }
  };

  const estadoColors: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    aprobada: 'bg-green-100 text-green-800',
    rechazada: 'bg-red-100 text-red-800',
    cancelada: 'bg-gray-100 text-gray-800',
  };

  const columns = [
    { key: 'folio', label: 'Folio' },
    {
      key: 'empleado',
      label: 'Empleado',
      render: (sol: Solicitud) =>
        sol.empleado
          ? `${sol.empleado.nombre} ${sol.empleado.apellidos}`
          : 'N/A',
    },
    {
      key: 'tipo_solicitud',
      label: 'Tipo',
      render: (sol: Solicitud) =>
        sol.tipo_solicitud === 'vacaciones' ? 'Vacaciones' : 'Día Económico',
    },
    {
      key: 'fecha_inicio',
      label: 'Fecha Inicio',
      render: (sol: Solicitud) =>
        new Date(sol.fecha_inicio).toLocaleDateString('es-MX'),
    },
    {
      key: 'dias_habiles',
      label: 'Días',
      render: (sol: Solicitud) => `${sol.dias_habiles} días`,
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (sol: Solicitud) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            estadoColors[sol.estado]
          }`}
        >
          {sol.estado.charAt(0).toUpperCase() + sol.estado.slice(1)}
        </span>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (sol: Solicitud) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/solicitudes/${sol.id}`)}
          >
            Ver
          </Button>
          {sol.pdf_path && (
            <Button
              size="sm"
              variant="success"
              onClick={() => handleDownloadPDF(sol.id)}
            >
              PDF
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <MainLayout><Loading /></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Solicitudes</h1>
            <p className="text-gray-600 mt-1">
              Gestión de solicitudes de vacaciones y días económicos
            </p>
          </div>
          <Button onClick={() => navigate('/solicitudes/nueva')}>
            + Nueva Solicitud
          </Button>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}

        {/* Filtros */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Filtrar por Estado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              options={[
                { value: '', label: 'Todos' },
                { value: 'pendiente', label: 'Pendiente' },
                { value: 'aprobada', label: 'Aprobada' },
                { value: 'rechazada', label: 'Rechazada' },
                { value: 'cancelada', label: 'Cancelada' },
              ]}
            />
            <Select
              label="Filtrar por Tipo"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              options={[
                { value: '', label: 'Todos' },
                { value: 'vacaciones', label: 'Vacaciones' },
                { value: 'dia_economico', label: 'Día Económico' },
              ]}
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Table data={solicitudes} columns={columns} />
        </div>

        <div className="text-sm text-gray-600">
          Mostrando {solicitudes.length} solicitudes
        </div>
      </div>
    </MainLayout>
  );
};
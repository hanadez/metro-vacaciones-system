import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { Alert } from '../../components/common/Alert';
import { solicitudesService } from '../../services/solicitudesService';
import type { Solicitud } from '../../types';
import { useParams } from 'react-router-dom';

export const DetalleSolicitud: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadSolicitud(id);
  }, [id]);

  const loadSolicitud = async (solicitudId: string) => {
    try {
      setLoading(true);
      const response = await solicitudesService.getById(solicitudId);
      setSolicitud(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!solicitud) return;
    try {
      await solicitudesService.generatePDF(solicitud.id);
      loadSolicitud(solicitud.id);
    } catch (err: any) {
      setError('Error al generar PDF');
    }
  };

  const handleDownloadPDF = async () => {
    if (!solicitud) return;
    try {
      const response = await solicitudesService.getPDF(solicitud.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${solicitud.folio}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setError('Error al descargar PDF');
    }
  };

  if (loading) return <MainLayout><Loading /></MainLayout>;
  if (!solicitud)
    return (
      <MainLayout>
        <Alert type="error" message="Solicitud no encontrada" />
      </MainLayout>
    );

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Solicitud {solicitud.folio}
            </h1>
            <p className="text-gray-600 mt-1">
              {solicitud.tipo_solicitud === 'vacaciones'
                ? 'Vacaciones'
                : 'Día Económico'}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={() => navigate('/solicitudes')}
            >
              Volver
            </Button>
            {solicitud.pdf_path ? (
              <Button onClick={handleDownloadPDF}>Descargar PDF</Button>
            ) : (
              <Button onClick={handleGeneratePDF}>Generar PDF</Button>
            )}
          </div>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}

        {solicitud.tiene_conflicto_descanso && solicitud.mensaje_warning && (
          <Alert type="warning" message={solicitud.mensaje_warning} />
        )}

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          {/* Información del Empleado */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Información del Empleado
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Nombre Completo
                </label>
                <p className="mt-1 text-gray-900">
                  {solicitud.empleado
                    ? `${solicitud.empleado.nombre} ${solicitud.empleado.apellidos}`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  No. Expediente
                </label>
                <p className="mt-1 text-gray-900">
                  {solicitud.empleado?.numero_expediente || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Detalles de la Solicitud */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">
              Detalles de la Solicitud
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Tipo
                </label>
                <p className="mt-1 text-gray-900">
                  {solicitud.tipo_vacacion?.nombre ||
                    solicitud.tipo_dia_economico?.nombre ||
                    'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Fecha de Solicitud
                </label>
                <p className="mt-1 text-gray-900">
                  {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-MX')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Fecha de Inicio
                </label>
                <p className="mt-1 text-gray-900">
                  {new Date(solicitud.fecha_inicio).toLocaleDateString('es-MX')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Fecha de Reanudación
                </label>
                <p className="mt-1 text-gray-900">
                  {new Date(solicitud.fecha_reanudar).toLocaleDateString('es-MX')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Días Hábiles
                </label>
                <p className="mt-1 text-gray-900">{solicitud.dias_habiles} días</p>
              </div>
              {solicitud.periodo && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Periodo
                  </label>
                  <p className="mt-1 text-gray-900">{solicitud.periodo}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Estado</label>
                <p className="mt-1">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      {
                        pendiente: 'bg-yellow-100 text-yellow-800',
                        aprobada: 'bg-green-100 text-green-800',
                        rechazada: 'bg-red-100 text-red-800',
                        cancelada: 'bg-gray-100 text-gray-800',
                      }[solicitud.estado]
                    }`}
                  >
                    {solicitud.estado.charAt(0).toUpperCase() +
                      solicitud.estado.slice(1)}
                  </span>
                </p>
              </div>
            </div>
            {solicitud.observaciones && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-500">
                  Observaciones
                </label>
                <p className="mt-1 text-gray-900">{solicitud.observaciones}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
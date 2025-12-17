import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { Alert } from '../../components/common/Alert';
import { empleadosService } from '../../services/empleadosService';
import type { Empleado } from '../../types';
import { EmpleadoForm } from '../../components/forms/EmpleadoForm';
import { useParams } from 'react-router-dom';
import type { SaldoVacaciones } from '../../types';

export const DetalleEmpleado: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [saldos, setSaldos] = useState<SaldoVacaciones[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (id) loadEmpleado(parseInt(id));
  }, [id]);

  const loadEmpleado = async (empleadoId: number) => {
    try {
      setLoading(true);
      const [empResponse, saldosResponse] = await Promise.all([
        empleadosService.getById(empleadoId),
        empleadosService.getSaldos(empleadoId),
      ]);
      setEmpleado(empResponse.data);
      setSaldos(saldosResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar empleado');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!empleado) return;
    try {
      const response = await empleadosService.update(empleado.id, data);
      setEmpleado(response.data);
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al actualizar empleado');
    }
  };

  if (loading) return <MainLayout><Loading /></MainLayout>;
  if (!empleado)
    return (
      <MainLayout>
        <Alert type="error" message="Empleado no encontrado" />
      </MainLayout>
    );

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {empleado.nombre} {empleado.apellidos}
            </h1>
            <p className="text-gray-600 mt-1">
              Expediente: {empleado.numero_expediente}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={() => navigate('/empleados')}>
              Volver
            </Button>
            <Button onClick={() => setEditing(!editing)}>
              {editing ? 'Cancelar' : 'Editar'}
            </Button>
          </div>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del Empleado */}
          <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Información Personal</h2>
            {editing ? (
              <EmpleadoForm
                initialData={empleado}
                onSubmit={handleUpdate}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Categoría Laboral
                  </label>
                  <p className="mt-1 text-gray-900">
                    {empleado.categoria_laboral || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Fecha de Ingreso
                  </label>
                  <p className="mt-1 text-gray-900">
                    {new Date(empleado.fecha_ingreso).toLocaleDateString('es-MX')}
                  </p>
                </div>
                {empleado.linea_metro && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Línea Metro
                    </label>
                    <p className="mt-1 text-gray-900">{empleado.linea_metro}</p>
                  </div>
                )}
                {empleado.turno && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Turno</label>
                    <p className="mt-1 text-gray-900">{empleado.turno}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <p className="mt-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        empleado.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {empleado.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Saldos de Vacaciones */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Saldos de Vacaciones</h2>
            {saldos.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay saldos disponibles</p>
            ) : (
              <div className="space-y-3">
                {saldos.map((saldo) => (
                  <div
                    key={saldo.id}
                    className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-blue-900">
                        {saldo.periodo}
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {saldo.dias_disponibles}
                      </span>
                    </div>
                    <div className="text-xs text-blue-700">
                      <div>Otorgados: {saldo.dias_otorgados}</div>
                      <div>Utilizados: {saldo.dias_utilizados}</div>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {saldos.reduce((sum, s) => sum + s.dias_disponibles, 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botón para crear solicitud */}
        <div className="bg-white shadow rounded-lg p-6">
          <Button onClick={() => navigate(`/solicitudes/nueva?empleado=${empleado.id}`)}>
            Crear Solicitud para este Empleado
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};
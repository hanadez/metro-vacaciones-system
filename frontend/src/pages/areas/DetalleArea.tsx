import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { Alert } from '../../components/common/Alert';
import { areasService } from '../../services/areasService';
import type { Area } from '../../types';
import { AreaForm } from '../../components/forms/AreaForm';
import { useParams } from 'react-router-dom';

export const DetalleArea: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [area, setArea] = useState<Area | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (id) loadArea(parseInt(id));
  }, [id]);

  const loadArea = async (areaId: number) => {
    try {
      setLoading(true);
      const response = await areasService.getById(areaId);
      setArea(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar área');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!area) return;
    try {
      const response = await areasService.update(area.id, data);
      setArea(response.data);
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al actualizar área');
    }
  };

  if (loading) return <MainLayout><Loading /></MainLayout>;
  if (!area) return <MainLayout><Alert type="error" message="Área no encontrada" /></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{area.nombre}</h1>
            <p className="text-gray-600 mt-1">Código: {area.codigo}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={() => navigate('/areas')}>
              Volver
            </Button>
            <Button onClick={() => setEditing(!editing)}>
              {editing ? 'Cancelar' : 'Editar'}
            </Button>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        <div className="bg-white shadow rounded-lg p-6">
          {editing ? (
            <AreaForm initialData={area} onSubmit={handleUpdate} />
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Descripción</label>
                <p className="mt-1 text-gray-900">{area.descripcion || 'Sin descripción'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Estado</label>
                <p className="mt-1">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      area.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {area.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de creación</label>
                <p className="mt-1 text-gray-900">
                  {new Date(area.fecha_creacion).toLocaleDateString('es-MX')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { Loading } from '../../components/common/Loading';
import { Alert } from '../../components/common/Alert';
import { areasService } from '../../services/areasService';
import type { Area } from '../../types';

export const ListaAreas: React.FC = () => {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      setLoading(true);
      const response = await areasService.getAll();
      setAreas(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar áreas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta área?')) return;

    try {
      await areasService.delete(id);
      setAreas(areas.filter((a) => a.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al eliminar área');
    }
  };

  const columns = [
    { key: 'codigo', label: 'Código' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
    {
      key: 'activo',
      label: 'Estado',
      render: (area: Area) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            area.activo
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {area.activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (area: Area) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/areas/${area.id}`)}
          >
            Ver
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(area.id)}
          >
            Eliminar
          </Button>
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
            <h1 className="text-3xl font-bold text-gray-900">Áreas</h1>
            <p className="text-gray-600 mt-1">Gestión de áreas del sistema</p>
          </div>
          <Button onClick={() => navigate('/areas/nueva')}>
            + Nueva Área
          </Button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Table data={areas} columns={columns} />
        </div>
      </div>
    </MainLayout>
  );
};

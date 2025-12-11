import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { Loading } from '../../components/common/Loading';
import { Alert } from '../../components/common/Alert';
import { Input } from '../../components/common/Input';
import { empleadosService } from '../../services/empleadosService';
import type { Empleado } from '../../types';

export const ListaEmpleados: React.FC = () => {
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [filteredEmpleados, setFilteredEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEmpleados();
  }, []);

  useEffect(() => {
    filterEmpleados();
  }, [searchTerm, empleados]);

  const loadEmpleados = async () => {
    try {
      setLoading(true);
      const response = await empleadosService.getAll();
      setEmpleados(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const filterEmpleados = () => {
    if (!searchTerm) {
      setFilteredEmpleados(empleados);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = empleados.filter(
      (emp) =>
        emp.nombre.toLowerCase().includes(term) ||
        emp.apellidos.toLowerCase().includes(term) ||
        emp.numero_expediente.toLowerCase().includes(term)
    );
    setFilteredEmpleados(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este empleado?')) return;

    try {
      await empleadosService.delete(id);
      setEmpleados(empleados.filter((e) => e.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al eliminar empleado');
    }
  };

  const columns = [
    { key: 'numero_expediente', label: 'No. Expediente' },
    {
      key: 'nombre_completo',
      label: 'Nombre Completo',
      render: (emp: Empleado) => `${emp.nombre} ${emp.apellidos}`,
    },
    { key: 'categoria_laboral', label: 'Categoría' },
    {
      key: 'fecha_ingreso',
      label: 'Fecha Ingreso',
      render: (emp: Empleado) =>
        new Date(emp.fecha_ingreso).toLocaleDateString('es-MX'),
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (emp: Empleado) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            emp.activo
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {emp.activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (emp: Empleado) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/empleados/${emp.id}`)}
          >
            Ver
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(emp.id)}>
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
            <h1 className="text-3xl font-bold text-gray-900">Empleados</h1>
            <p className="text-gray-600 mt-1">
              Gestión de empleados del área
            </p>
          </div>
          <Button onClick={() => navigate('/empleados/nuevo')}>
            + Nuevo Empleado
          </Button>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}

        <div className="bg-white shadow rounded-lg p-4">
          <Input
            type="text"
            placeholder="Buscar por nombre, apellido o expediente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Table data={filteredEmpleados} columns={columns} />
        </div>

        <div className="text-sm text-gray-600">
          Mostrando {filteredEmpleados.length} de {empleados.length} empleados
        </div>
      </div>
    </MainLayout>
  );
};
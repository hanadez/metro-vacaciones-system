import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import api from '../../config/api';

export const AdminAreaDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    empleados: 0,
    pendientes: 0,
    aprobadas: 0,
    total_solicitudes: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setStats({
        empleados: 35,
        pendientes: 8,
        aprobadas: 42,
        total_solicitudes: 58,
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const statsCards = [
    {
      name: 'Empleados',
      value: stats.empleados,
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'blue',
    },
    {
      name: 'Pendientes',
      value: stats.pendientes,
      icon: (
        <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'yellow',
    },
    {
      name: 'Aprobadas',
      value: stats.aprobadas,
      icon: (
        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
    },
    {
      name: 'Total Solicitudes',
      value: stats.total_solicitudes,
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'purple',
    },
  ];

  const quickActions = [
    {
      name: 'Nueva Solicitud',
      description: 'Crear solicitud de vacaciones o día económico',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      action: () => navigate('/solicitudes/nueva'),
    },
    {
      name: 'Gestionar Empleados',
      description: 'Ver y administrar empleados del área',
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      action: () => navigate('/empleados'),
    },
    {
      name: 'Ver Solicitudes',
      description: 'Revisar todas las solicitudes del área',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      action: () => navigate('/solicitudes'),
    },
    {
      name: 'Configurar Firmantes',
      description: 'Configurar firmantes para los documentos',
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      action: () => navigate('/configuracion/area'),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Área</h1>
          <p className="text-gray-600 mt-1">Panel de gestión del área</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">{stat.icon}</div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{stat.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <button
                key={action.name}
                onClick={action.action}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left group"
              >
                <div className="mb-3">{action.icon}</div>
                <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {action.name}
                </div>
                <div className="text-sm text-gray-500 mt-1">{action.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Solicitudes Pendientes</h2>
          <div className="space-y-3">
            {[
              { empleado: 'Juan Pérez', tipo: 'Vacaciones', dias: '5 días', fecha: '15-20 Dic' },
              { empleado: 'María García', tipo: 'Día Económico', dias: '1 día', fecha: '18 Dic' },
              { empleado: 'Carlos López', tipo: 'Vacaciones', dias: '3 días', fecha: '22-24 Dic' },
            ].map((solicitud, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{solicitud.empleado}</p>
                  <p className="text-sm text-gray-500">{solicitud.tipo} - {solicitud.dias}</p>
                </div>
                <div className="text-right mr-4">
                  <span className="text-xs text-gray-400">{solicitud.fecha}</span>
                </div>
                <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                  Ver
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
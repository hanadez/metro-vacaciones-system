/**
 * Componente para proteger rutas
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { RolUsuario } from '../types';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: RolUsuario;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.rol !== requiredRole) {
    // Redirigir al dashboard correcto según el rol
    const redirectPath = user.rol === 'superadmin' 
      ? '/dashboard/superadmin' 
      : '/dashboard/area';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
/**
 * Componente principal de la aplicación
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Login } from './pages/auth/Login';
import { SuperAdminDashboard } from './pages/dashboard/SuperAdminDashboard';
import { AdminAreaDashboard } from './pages/dashboard/AdminAreaDashboard';
import { PrivateRoute } from './routes/PrivateRoute';

// Crear QueryClient para React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Ruta pública */}
            <Route path="/login" element={<Login />} />

            {/* Rutas protegidas - SuperAdmin */}
            <Route
              path="/dashboard/superadmin"
              element={
                <PrivateRoute requiredRole="superadmin">
                  <SuperAdminDashboard />
                </PrivateRoute>
              }
            />

            {/* Rutas protegidas - Admin Área */}
            <Route
              path="/dashboard/area"
              element={
                <PrivateRoute requiredRole="admin_area">
                  <AdminAreaDashboard />
                </PrivateRoute>
              }
            />

            {/* Ruta por defecto */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
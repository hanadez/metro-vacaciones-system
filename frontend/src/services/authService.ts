/**
 * Servicio de autenticación
 */

import axios from 'axios';
import type { LoginCredentials, AuthResponse, Usuario } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Configurar axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, limpiar tokens y redirigir al login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login/', credentials);
    
    // Guardar tokens y usuario en localStorage
    localStorage.setItem('access_token', response.data.tokens.access);
    localStorage.setItem('refresh_token', response.data.tokens.refresh);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  },

  /**
   * Cerrar sesión
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  /**
   * Obtener usuario actual desde localStorage
   */
  getCurrentUser(): Usuario | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  },

  /**
   * Actualizar último acceso del usuario
   */
  async updateLastAccess(): Promise<void> {
    await api.post('/auth/update-access/');
  },

  /**
   * Cambiar contraseña
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },

  /**
   * Solicitar recuperación de contraseña
   */
  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/password-reset/', { email });
  },

  /**
   * Obtener perfil del usuario actual
   */
  async getProfile(): Promise<Usuario> {
    const response = await api.get<Usuario>('/auth/profile/');
    
    // Actualizar localStorage
    localStorage.setItem('user', JSON.stringify(response.data));
    
    return response.data;
  },
};

export { api };
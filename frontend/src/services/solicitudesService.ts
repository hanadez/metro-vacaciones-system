import api from '../config/api';
import type { Solicitud, SolicitudFormData, PaginatedResponse } from '../types';

export const solicitudesService = {
  getAll: (params?: any) =>
    api.get<PaginatedResponse<Solicitud>>('/solicitudes/', { params }),
  getById: (id: string) => api.get<Solicitud>(`/solicitudes/${id}/`),
  create: (data: SolicitudFormData) =>
    api.post<Solicitud>('/solicitudes/', data),
  update: (id: string, data: Partial<SolicitudFormData>) =>
    api.put<Solicitud>(`/solicitudes/${id}/`, data),
  delete: (id: string) => api.delete(`/solicitudes/${id}/`),
  generatePDF: (id: string) =>
    api.post<{ pdf_url: string }>(`/solicitudes/${id}/generar-pdf/`),
  getPDF: (id: string) => api.get(`/solicitudes/${id}/pdf/`, { responseType: 'blob' }),
  calcularFechaReanudacion: (data: { fecha_inicio: string; dias_habiles: number }) =>
    api.post('/solicitudes/calcular-fecha-reanudacion/', data),
};
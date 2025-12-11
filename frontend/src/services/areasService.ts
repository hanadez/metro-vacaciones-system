import api from '../config/api';
import type { Area, AreaFormData } from '../types';

export const areasService = {
  getAll: () => api.get<Area[]>('/areas/'),
  getById: (id: number) => api.get<Area>(`/areas/${id}/`),
  create: (data: AreaFormData) => api.post<Area>('/areas/', data),
  update: (id: number, data: Partial<AreaFormData>) =>
    api.put<Area>(`/areas/${id}/`, data),
  delete: (id: number) => api.delete(`/areas/${id}/`),
};

import api from '../config/api';
import type { Empleado, EmpleadoFormData, SaldoVacaciones } from '../types';

export const empleadosService = {
  getAll: (areaId?: number) =>
    api.get<Empleado[]>('/empleados/', { params: { area_id: areaId } }),
  getById: (id: number) => api.get<Empleado>(`/empleados/${id}/`),
  create: (data: EmpleadoFormData) => api.post<Empleado>('/empleados/', data),
  update: (id: number, data: Partial<EmpleadoFormData>) =>
    api.put<Empleado>(`/empleados/${id}/`, data),
  delete: (id: number) => api.delete(`/empleados/${id}/`),
  getSaldos: (id: number) =>
    api.get<SaldoVacaciones[]>(`/empleados/${id}/saldos/`),
};
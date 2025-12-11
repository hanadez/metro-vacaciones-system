import type {
  ConfigGlobal,
  TipoVacacion,
  TipoDiaEconomico,
  Requisito,
  Firmante,
} from '../types';

export const configuracionService = {
  // Configuración Global
  getConfigGlobal: () => api.get<ConfigGlobal[]>('/configuracion/global/'),
  updateConfigGlobal: (clave: string, valor: any) =>
    api.put(`/configuracion/global/${clave}/`, { valor }),

  // Tipos de Vacaciones
  getTiposVacaciones: (areaId?: number) =>
    api.get<TipoVacacion[]>('/catalogos/tipos-vacaciones/', {
      params: { area_id: areaId },
    }),
  createTipoVacacion: (data: Partial<TipoVacacion>) =>
    api.post<TipoVacacion>('/catalogos/tipos-vacaciones/', data),
  updateTipoVacacion: (id: number, data: Partial<TipoVacacion>) =>
    api.put<TipoVacacion>(`/catalogos/tipos-vacaciones/${id}/`, data),
  deleteTipoVacacion: (id: number) =>
    api.delete(`/catalogos/tipos-vacaciones/${id}/`),

  // Tipos de Días Económicos
  getTiposDiasEconomicos: (areaId?: number) =>
    api.get<TipoDiaEconomico[]>('/catalogos/tipos-dias-economicos/', {
      params: { area_id: areaId },
    }),
  createTipoDiaEconomico: (data: Partial<TipoDiaEconomico>) =>
    api.post<TipoDiaEconomico>('/catalogos/tipos-dias-economicos/', data),
  updateTipoDiaEconomico: (id: number, data: Partial<TipoDiaEconomico>) =>
    api.put<TipoDiaEconomico>(`/catalogos/tipos-dias-economicos/${id}/`, data),
  deleteTipoDiaEconomico: (id: number) =>
    api.delete(`/catalogos/tipos-dias-economicos/${id}/`),

  // Requisitos
  getRequisitos: (areaId?: number) =>
    api.get<Requisito[]>('/catalogos/requisitos/', {
      params: { area_id: areaId },
    }),
  createRequisito: (data: Partial<Requisito>) =>
    api.post<Requisito>('/catalogos/requisitos/', data),
  updateRequisito: (id: number, data: Partial<Requisito>) =>
    api.put<Requisito>(`/catalogos/requisitos/${id}/`, data),
  deleteRequisito: (id: number) =>
    api.delete(`/catalogos/requisitos/${id}/`),

  // Firmantes
  getFirmantes: (areaId: number) =>
    api.get<Firmante[]>(`/catalogos/firmantes/?area_id=${areaId}`),
  createFirmante: (data: Partial<Firmante>) =>
    api.post<Firmante>('/catalogos/firmantes/', data),
  updateFirmante: (id: number, data: Partial<Firmante>) =>
    api.put<Firmante>(`/catalogos/firmantes/${id}/`, data),
  deleteFirmante: (id: number) => api.delete(`/catalogos/firmantes/${id}/`),
};
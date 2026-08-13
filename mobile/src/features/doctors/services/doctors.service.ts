import { api } from '../../../shared/services/api';
import type { ApiResponse } from '../../../shared/types/api.types';

export interface Doctor {
  id: string;
  name: string;
  specialization: string | null;
  hospital: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateDoctorPayload {
  name: string;
  specialization?: string;
  hospital?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export const doctorsService = {
  getAll: () => api.get<ApiResponse<Doctor[]>>('/doctors').then((r) => r.data.data),
  getOne: (id: string) => api.get<ApiResponse<Doctor>>(`/doctors/${id}`).then((r) => r.data.data),
  create: (data: CreateDoctorPayload) => api.post<ApiResponse<Doctor>>('/doctors', data).then((r) => r.data.data),
  update: (id: string, data: Partial<CreateDoctorPayload>) => api.patch<ApiResponse<Doctor>>(`/doctors/${id}`, data).then((r) => r.data.data),
  remove: (id: string) => api.delete(`/doctors/${id}`).then((r) => r.data),
};

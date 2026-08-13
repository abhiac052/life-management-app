import { api } from '../../../shared/services/api';
import type { ApiResponse } from '../../../shared/types/api.types';

export interface Appointment {
  id: string;
  doctorId: string | null;
  doctorName: string;
  date: string;
  time: string;
  purpose: string | null;
  notes: string | null;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  prescriptionId: string | null;
  doctor: { id: string; name: string; specialization: string | null } | null;
  createdAt: string;
}

export interface CreateAppointmentPayload {
  doctorId?: string;
  doctorName: string;
  date: string;
  time: string;
  purpose?: string;
  notes?: string;
  prescriptionId?: string;
}

export const appointmentsService = {
  getAll: (status?: string) =>
    api.get<ApiResponse<Appointment[]>>('/appointments', { params: status ? { status } : undefined }).then((r) => r.data.data),
  getOne: (id: string) => api.get<ApiResponse<Appointment>>(`/appointments/${id}`).then((r) => r.data.data),
  create: (data: CreateAppointmentPayload) => api.post<ApiResponse<Appointment>>('/appointments', data).then((r) => r.data.data),
  update: (id: string, data: Partial<CreateAppointmentPayload> & { status?: string }) =>
    api.patch<ApiResponse<Appointment>>(`/appointments/${id}`, data).then((r) => r.data.data),
  remove: (id: string) => api.delete(`/appointments/${id}`).then((r) => r.data),
};

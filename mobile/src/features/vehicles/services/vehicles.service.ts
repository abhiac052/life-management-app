import { api } from '../../../shared/services/api';
import type { ApiResponse } from '../../../shared/types/api.types';

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  registrationNo: string | null;
  insuranceExpiry: string | null;
  pucExpiry: string | null;
  nextServiceDate: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateVehiclePayload {
  name: string;
  type: string;
  registrationNo?: string;
  insuranceExpiry?: string;
  pucExpiry?: string;
  nextServiceDate?: string;
  notes?: string;
}

export const vehiclesService = {
  getAll: () => api.get<ApiResponse<Vehicle[]>>('/vehicles').then((r) => r.data.data),
  getOne: (id: string) => api.get<ApiResponse<Vehicle>>(`/vehicles/${id}`).then((r) => r.data.data),
  create: (data: CreateVehiclePayload) =>
    api.post<ApiResponse<Vehicle>>('/vehicles', data).then((r) => r.data.data),
  update: (id: string, data: Partial<CreateVehiclePayload>) =>
    api.patch<ApiResponse<Vehicle>>(`/vehicles/${id}`, data).then((r) => r.data.data),
  remove: (id: string) => api.delete(`/vehicles/${id}`).then((r) => r.data),
};

import { api } from '../../../shared/services/api';
import type { ApiResponse } from '../../../shared/types/api.types';

export interface MedicineSchedule {
  id: string;
  medicineId: string;
  time: string;
  label: string | null;
  daysOfWeek: number[];
  isActive: boolean;
}

export interface MedicineStock {
  id: string;
  medicineId: string;
  currentQty: number;
  unitsPerDose: number;
  dosesPerDay: number;
  refillThreshold: number;
  lastUpdated: string;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  form: string;
  mealRelation: string;
  instructions: string | null;
  notes: string | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  prescriptionId: string | null;
  schedules: MedicineSchedule[];
  stock: MedicineStock | null;
  createdAt: string;
}

export interface TodayDose {
  medicineId: string;
  medicineName: string;
  dosage: string;
  form: string;
  mealRelation: string;
  scheduleId: string;
  scheduleTime: string;
  scheduleLabel: string | null;
  scheduledAt: string;
  status: 'pending' | 'taken' | 'skipped' | 'missed';
  logId: string | null;
  stock: MedicineStock | null;
}

export interface Adherence {
  medicineId: string;
  from: string;
  to: string;
  total: number;
  taken: number;
  skipped: number;
  missed: number;
  adherencePercent: number | null;
}

export interface CreateMedicinePayload {
  name: string;
  dosage: string;
  form: string;
  mealRelation?: string;
  instructions?: string;
  notes?: string;
  startDate: string;
  endDate?: string;
  prescriptionId?: string;
  schedules?: { time: string; label?: string; daysOfWeek: number[] }[];
  stockQty?: number;
  unitsPerDose?: number;
  dosesPerDay?: number;
  refillThreshold?: number;
}

export const medicinesService = {
  getAll: (isActive?: boolean) =>
    api
      .get<ApiResponse<Medicine[]>>('/medicines', {
        params: isActive !== undefined ? { isActive } : undefined,
      })
      .then((r) => r.data.data),

  getOne: (id: string) =>
    api.get<ApiResponse<Medicine>>(`/medicines/${id}`).then((r) => r.data.data),

  getToday: () =>
    api.get<ApiResponse<TodayDose[]>>('/medicines/today').then((r) => r.data.data),

  create: (data: CreateMedicinePayload) =>
    api.post<ApiResponse<Medicine>>('/medicines', data).then((r) => r.data.data),

  update: (id: string, data: Partial<CreateMedicinePayload>) =>
    api.patch<ApiResponse<Medicine>>(`/medicines/${id}`, data).then((r) => r.data.data),

  remove: (id: string) => api.delete(`/medicines/${id}`).then((r) => r.data),

  deactivate: (id: string) =>
    api.patch<ApiResponse<Medicine>>(`/medicines/${id}/deactivate`).then((r) => r.data.data),

  logDose: (data: { scheduleId: string; scheduledAt: string; action: 'taken' | 'skipped'; note?: string }) =>
    api.post('/medicines/doses/log', data).then((r) => r.data),

  getAdherence: (id: string, from?: string, to?: string) =>
    api
      .get<ApiResponse<Adherence>>(`/medicines/${id}/adherence`, { params: { from, to } })
      .then((r) => r.data.data),

  upsertStock: (
    id: string,
    data: { currentQty: number; unitsPerDose?: number; dosesPerDay?: number; refillThreshold?: number },
  ) => api.patch<ApiResponse<MedicineStock>>(`/medicines/${id}/stock`, data).then((r) => r.data.data),

  addSchedule: (medicineId: string, data: { time: string; label?: string; daysOfWeek: number[] }) =>
    api.post<ApiResponse<MedicineSchedule>>(`/medicines/${medicineId}/schedules`, data).then((r) => r.data.data),

  removeSchedule: (medicineId: string, scheduleId: string) =>
    api.delete(`/medicines/${medicineId}/schedules/${scheduleId}`).then((r) => r.data),
};

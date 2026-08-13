import { api } from '../../../shared/services/api';
import type { ApiResponse } from '../../../shared/types/api.types';

export interface Prescription {
  id: string;
  doctorName: string;
  clinicName: string | null;
  date: string;
  notes: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  medicines: { id: string; name: string; dosage: string }[];
  createdAt: string;
}

export interface CreatePrescriptionPayload {
  doctorName: string;
  clinicName?: string;
  date: string;
  notes?: string;
  file?: { uri: string; name: string; type: string };
}

export const prescriptionsService = {
  getAll: () => api.get<ApiResponse<Prescription[]>>('/prescriptions').then((r) => r.data.data),
  getOne: (id: string) => api.get<ApiResponse<Prescription>>(`/prescriptions/${id}`).then((r) => r.data.data),
  create: (payload: CreatePrescriptionPayload) => {
    const form = new FormData();
    form.append('doctorName', payload.doctorName);
    form.append('date', payload.date);
    if (payload.clinicName) form.append('clinicName', payload.clinicName);
    if (payload.notes) form.append('notes', payload.notes);
    if (payload.file) form.append('file', payload.file as unknown as Blob);
    return api.post<ApiResponse<Prescription>>('/prescriptions', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.data);
  },
  update: (id: string, data: Partial<Omit<CreatePrescriptionPayload, 'file'>>) =>
    api.patch<ApiResponse<Prescription>>(`/prescriptions/${id}`, data).then((r) => r.data.data),
  remove: (id: string) => api.delete(`/prescriptions/${id}`).then((r) => r.data),
  getDownloadUrl: (id: string) =>
    api.get<ApiResponse<{ url: string; expiresAt: string }>>(`/prescriptions/${id}/download-url`).then((r) => r.data.data),
};

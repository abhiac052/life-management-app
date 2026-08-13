import { api } from '../../../shared/services/api';
import type { ApiResponse } from '../../../shared/types/api.types';

export interface MedicalReport {
  id: string;
  title: string;
  type: string;
  date: string;
  doctorLab: string | null;
  notes: string | null;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface CreateMedicalReportPayload {
  title: string;
  type: string;
  date: string;
  doctorLab?: string;
  notes?: string;
  file: { uri: string; name: string; type: string };
}

export const medicalReportsService = {
  getAll: (type?: string) =>
    api.get<ApiResponse<MedicalReport[]>>('/medical-reports', { params: type ? { type } : undefined }).then((r) => r.data.data),
  getOne: (id: string) => api.get<ApiResponse<MedicalReport>>(`/medical-reports/${id}`).then((r) => r.data.data),
  create: (payload: CreateMedicalReportPayload) => {
    const form = new FormData();
    form.append('title', payload.title);
    form.append('type', payload.type);
    form.append('date', payload.date);
    if (payload.doctorLab) form.append('doctorLab', payload.doctorLab);
    if (payload.notes) form.append('notes', payload.notes);
    form.append('file', payload.file as unknown as Blob);
    return api.post<ApiResponse<MedicalReport>>('/medical-reports', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.data);
  },
  remove: (id: string) => api.delete(`/medical-reports/${id}`).then((r) => r.data),
  getDownloadUrl: (id: string) =>
    api.get<ApiResponse<{ url: string; expiresAt: string }>>(`/medical-reports/${id}/download-url`).then((r) => r.data.data),
};

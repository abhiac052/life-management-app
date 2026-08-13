import { api } from '../../../shared/services/api';
import type { ApiResponse } from '../../../shared/types/api.types';

export interface Document {
  id: string;
  name: string;
  category: string;
  description: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  tags: string[];
  notes: string | null;
  fileName: string;
  fileSize: number;
  mimeType: string;
  deletedAt: string | null;
  createdAt: string;
}

export interface UploadDocumentPayload {
  file: { uri: string; name: string; type: string };
  name: string;
  category: string;
  description?: string;
  issueDate?: string;
  expiryDate?: string;
  tags?: string[];
  notes?: string;
  setExpiryReminder?: boolean;
  reminderDaysBefore?: number;
}

export const documentsService = {
  getAll: (params?: { category?: string; search?: string; page?: number; deleted?: boolean }) =>
    api.get<ApiResponse<Document[]>>('/documents', { params }).then(r => r.data),

  getOne: (id: string) =>
    api.get<ApiResponse<Document>>(`/documents/${id}`).then(r => r.data.data),

  upload: (payload: UploadDocumentPayload) => {
    const form = new FormData();
    form.append('file', payload.file as unknown as Blob);
    form.append('name', payload.name);
    form.append('category', payload.category);
    if (payload.description) form.append('description', payload.description);
    if (payload.issueDate) form.append('issueDate', payload.issueDate);
    if (payload.expiryDate) form.append('expiryDate', payload.expiryDate);
    if (payload.tags) form.append('tags', JSON.stringify(payload.tags));
    if (payload.notes) form.append('notes', payload.notes);
    if (payload.setExpiryReminder !== undefined) form.append('setExpiryReminder', String(payload.setExpiryReminder));
    if (payload.reminderDaysBefore) form.append('reminderDaysBefore', String(payload.reminderDaysBefore));
    return api.post<ApiResponse<Document>>('/documents', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data.data);
  },

  update: (id: string, data: Partial<Pick<Document, 'name' | 'category' | 'description' | 'notes' | 'tags'>>) =>
    api.patch<ApiResponse<Document>>(`/documents/${id}`, data).then(r => r.data.data),

  softDelete: (id: string) =>
    api.delete(`/documents/${id}`).then(r => r.data),

  restore: (id: string) =>
    api.post(`/documents/${id}/restore`).then(r => r.data),

  getDownloadUrl: (id: string) =>
    api.get<ApiResponse<{ url: string; expiresAt: string }>>(`/documents/${id}/download-url`).then(r => r.data.data),
};

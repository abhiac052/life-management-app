import { api } from '../../../shared/services/api';
import type { ApiResponse } from '../../../shared/types/api.types';

export interface Warranty {
  id: string;
  productName: string;
  brand: string | null;
  model: string | null;
  purchaseDate: string;
  expiryDate: string;
  seller: string | null;
  notes: string | null;
  invoiceFileName: string | null;
  createdAt: string;
}

export interface CreateWarrantyPayload {
  productName: string;
  brand?: string;
  model?: string;
  purchaseDate: string;
  expiryDate: string;
  seller?: string;
  notes?: string;
}

export const warrantiesService = {
  getAll: () => api.get<ApiResponse<Warranty[]>>('/warranties').then((r) => r.data.data),
  getOne: (id: string) => api.get<ApiResponse<Warranty>>(`/warranties/${id}`).then((r) => r.data.data),
  create: (data: CreateWarrantyPayload) =>
    api.post<ApiResponse<Warranty>>('/warranties', data).then((r) => r.data.data),
  update: (id: string, data: Partial<CreateWarrantyPayload>) =>
    api.patch<ApiResponse<Warranty>>(`/warranties/${id}`, data).then((r) => r.data.data),
  remove: (id: string) => api.delete(`/warranties/${id}`).then((r) => r.data),
  getInvoiceUrl: (id: string) =>
    api.get<ApiResponse<{ url: string; expiresAt: string }>>(`/warranties/${id}/invoice-url`).then((r) => r.data.data),
};

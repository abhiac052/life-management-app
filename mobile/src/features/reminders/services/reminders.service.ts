import { api } from '../../../shared/services/api';
import type { ApiResponse } from '../../../shared/types/api.types';

export interface Reminder {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  dueDate: string;
  startDate: string;
  endDate: string | null;
  recurrenceType: string;
  recurrenceRule: Record<string, unknown> | null;
  notifyBefore: number[];
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';
  snoozedUntil: string | null;
  linkedEntityType: string;
  linkedEntityId: string | null;
  isSystemGenerated: boolean;
  createdAt: string;
}

export interface CreateReminderPayload {
  title: string;
  description?: string;
  category?: string;
  startDate: string;
  dueDate: string;
  endDate?: string;
  recurrenceType?: string;
  recurrenceRule?: Record<string, unknown>;
  notifyBefore?: number[];
}

export const remindersService = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<Reminder[]>>('/reminders', { params }).then(r => r.data),
  getOne: (id: string) =>
    api.get<ApiResponse<Reminder>>(`/reminders/${id}`).then(r => r.data.data),
  create: (data: CreateReminderPayload) =>
    api.post<ApiResponse<Reminder>>('/reminders', data).then(r => r.data.data),
  update: (id: string, data: Partial<CreateReminderPayload>) =>
    api.patch<ApiResponse<Reminder>>(`/reminders/${id}`, data).then(r => r.data.data),
  remove: (id: string) =>
    api.delete(`/reminders/${id}`).then(r => r.data),
  complete: (id: string) =>
    api.post<ApiResponse<Reminder>>(`/reminders/${id}/complete`).then(r => r.data.data),
  skip: (id: string) =>
    api.post<ApiResponse<Reminder>>(`/reminders/${id}/skip`).then(r => r.data.data),
  snooze: (id: string, duration: number) =>
    api.post<ApiResponse<Reminder>>(`/reminders/${id}/snooze`, { duration }).then(r => r.data.data),
  pause: (id: string) =>
    api.patch<ApiResponse<Reminder>>(`/reminders/${id}/pause`).then(r => r.data.data),
  resume: (id: string) =>
    api.patch<ApiResponse<Reminder>>(`/reminders/${id}/resume`).then(r => r.data.data),
  getHistory: (id: string) =>
    api.get(`/reminders/${id}/history`).then(r => r.data.data),
};

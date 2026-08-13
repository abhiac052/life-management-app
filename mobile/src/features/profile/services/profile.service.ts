import { api } from '../../../shared/services/api';
import type { ApiResponse } from '../../../shared/types/api.types';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface UserPreferences {
  timezone: string;
  notificationsEnabled: boolean;
  medicinePush: boolean;
  appointmentPush: boolean;
  reminderPush: boolean;
  warrantyPush: boolean;
  vehiclePush: boolean;
  documentPush: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  theme: string;
  timeFormat: string;
  defaultReminderTime: string;
}

export const profileService = {
  getProfile: () =>
    api.get<ApiResponse<UserProfile>>('/profile').then(r => r.data.data),
  updateProfile: (data: Partial<Pick<UserProfile, 'name' | 'phone'>>) =>
    api.patch<ApiResponse<UserProfile>>('/profile', data).then(r => r.data.data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch<ApiResponse<{ message: string }>>('/profile/password', data).then(r => r.data.data),
  getPreferences: () =>
    api.get<ApiResponse<UserPreferences>>('/profile/preferences').then(r => r.data.data),
  updatePreferences: (data: Partial<UserPreferences>) =>
    api.put<ApiResponse<UserPreferences>>('/profile/preferences', data).then(r => r.data.data),
  deleteAccount: (data: { password: string; confirmation: string }) =>
    api.delete<ApiResponse<{ message: string }>>('/profile/account', { data }).then(r => r.data.data),
};

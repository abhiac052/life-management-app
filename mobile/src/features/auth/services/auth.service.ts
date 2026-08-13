import { api } from '../../../shared/services/api';
import { ApiResponse } from '../../../shared/types/api.types';
import { AuthUser } from '../store/auth.store';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<LoginResponse>>('/auth/register', data).then((r) => r.data.data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', data).then((r) => r.data.data),

  refresh: (refreshToken: string) =>
    api
      .post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken })
      .then((r) => r.data.data),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};

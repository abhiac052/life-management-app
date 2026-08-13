import { Platform } from 'react-native';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  clearAllSecureStorage,
  deleteRefreshToken,
  getRefreshToken,
  saveRefreshToken,
  saveUserInfo,
} from './secure-storage';
import { useAuthStore } from '../../features/auth/store/auth.store';

// Android emulator → 10.0.2.2 reaches host machine
// iOS simulator / physical device → localhost or your machine IP
const API_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000/api/v1'
  : 'http://localhost:3000/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach access token ─────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: silent refresh on 401 ──────────────────────────────
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function processQueue(newToken: string) {
  refreshQueue.forEach((resolve) => resolve(newToken));
  refreshQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve) => {
        refreshQueue.push(resolve);
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const storedRefreshToken = await getRefreshToken();
      if (!storedRefreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken: storedRefreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = data.data;

      useAuthStore.getState().setAccessToken(accessToken);
      await saveRefreshToken(newRefreshToken);

      processQueue(accessToken);
      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch {
      await clearAllSecureStorage();
      useAuthStore.getState().clearAuth();
      // Navigation to login is handled by RootNavigator watching isAuthenticated
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

// ── Auth helpers used by hooks ────────────────────────────────────────────────
export async function persistLogin(
  accessToken: string,
  refreshToken: string,
  user: Parameters<typeof useAuthStore.getState>['length'] extends never
    ? never
    : ReturnType<typeof useAuthStore.getState>['user'],
) {
  useAuthStore.getState().setTokens(accessToken, user!);
  await saveRefreshToken(refreshToken);
  await saveUserInfo(user!);
}

export async function performLogout(refreshToken?: string) {
  try {
    if (refreshToken) await api.post('/auth/logout', { refreshToken });
  } catch {
    // best-effort
  } finally {
    await clearAllSecureStorage();
    useAuthStore.getState().clearAuth();
    const storedToken = await getRefreshToken();
    if (storedToken) await deleteRefreshToken();
  }
}

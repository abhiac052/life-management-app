import { useState } from 'react';
import { authService } from '../services/auth.service';
import { persistLogin, performLogout } from '../../../shared/services/api';
import { getRefreshToken } from '../../../shared/services/secure-storage';

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.register({ name, email, password });
      await persistLogin(result.accessToken, result.refreshToken, result.user);
      return true;
    } catch (e: unknown) {
      const msg = extractErrorMessage(e) ?? 'Registration failed. Please try again.';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
}

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.login({ email, password });
      await persistLogin(result.accessToken, result.refreshToken, result.user);
      return true;
    } catch (e: unknown) {
      setError('Invalid email or password');
      void e;
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}

export function useLogout() {
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    const refreshToken = await getRefreshToken();
    await performLogout(refreshToken ?? undefined);
    setLoading(false);
  };

  return { logout, loading };
}

export function useAuth() {
  const { logout } = useLogout();
  const { login } = useLogin();
  const { register } = useRegister();
  return { logout, login, register };
}

function extractErrorMessage(e: unknown): string | null {
  if (
    e &&
    typeof e === 'object' &&
    'response' in e &&
    e.response &&
    typeof e.response === 'object' &&
    'data' in e.response
  ) {
    const data = (e.response as { data?: { error?: { message?: string } } }).data;
    return data?.error?.message ?? null;
  }
  return null;
}

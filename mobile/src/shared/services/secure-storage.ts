import * as Keychain from 'react-native-keychain';

const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_info';

export async function saveRefreshToken(token: string): Promise<void> {
  await Keychain.setGenericPassword(REFRESH_TOKEN_KEY, token, {
    service: REFRESH_TOKEN_KEY,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function getRefreshToken(): Promise<string | null> {
  const result = await Keychain.getGenericPassword({ service: REFRESH_TOKEN_KEY });
  return result ? result.password : null;
}

export async function deleteRefreshToken(): Promise<void> {
  await Keychain.resetGenericPassword({ service: REFRESH_TOKEN_KEY });
}

export async function saveUserInfo(user: object): Promise<void> {
  await Keychain.setGenericPassword(USER_KEY, JSON.stringify(user), {
    service: USER_KEY,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function getUserInfo<T>(): Promise<T | null> {
  const result = await Keychain.getGenericPassword({ service: USER_KEY });
  if (!result) return null;
  try {
    return JSON.parse(result.password) as T;
  } catch {
    return null;
  }
}

export async function deleteUserInfo(): Promise<void> {
  await Keychain.resetGenericPassword({ service: USER_KEY });
}

export async function clearAllSecureStorage(): Promise<void> {
  await Promise.all([deleteRefreshToken(), deleteUserInfo()]);
}

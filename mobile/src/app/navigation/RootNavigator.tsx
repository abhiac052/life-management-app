import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../../features/auth/store/auth.store';
import { authService } from '../../features/auth/services/auth.service';
import {
  getRefreshToken,
  getUserInfo,
  saveRefreshToken,
  saveUserInfo,
} from '../../shared/services/secure-storage';
import { AuthUser } from '../../features/auth/store/auth.store';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

export default function RootNavigator() {
  const { isAuthenticated, setTokens, clearAuth } = useAuthStore();
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          clearAuth();
          return;
        }

        const tokens = await authService.refresh(refreshToken);
        await saveRefreshToken(tokens.refreshToken);

        // Restore cached user or fall back to stored info
        const cachedUser = await getUserInfo<AuthUser>();
        if (cachedUser) {
          setTokens(tokens.accessToken, cachedUser);
          await saveUserInfo(cachedUser);
        } else {
          clearAuth();
        }
      } catch {
        clearAuth();
      } finally {
        setBootstrapping(false);
      }
    }

    bootstrap();
  }, []);

  if (bootstrapping) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

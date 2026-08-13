import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from './types';
import { ProfileHomeScreen } from '../../features/profile/screens/ProfileHomeScreen';
import { EditProfileScreen } from '../../features/profile/screens/EditProfileScreen';
import { ChangePasswordScreen } from '../../features/profile/screens/ChangePasswordScreen';
import { NotificationSettingsScreen } from '../../features/profile/screens/NotificationSettingsScreen';
import { DeleteAccountScreen } from '../../features/profile/screens/DeleteAccountScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileHome" component={ProfileHomeScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ title: 'Delete Account' }} />
    </Stack.Navigator>
  );
}

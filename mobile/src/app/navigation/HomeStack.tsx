import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList } from './types';
import { DashboardScreen } from '../../features/dashboard/screens/DashboardScreen';
import { makeStackScreenOptions } from './headerOptions';
import { useTheme } from '../../shared/theme/ThemeContext';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator screenOptions={({ navigation }) => makeStackScreenOptions(navigation, colors)}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { Text } from 'react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder screens — replaced in later sprints
const PlaceholderScreen = ({ name }: { name: string }) => (
  <Text style={{ flex: 1, textAlign: 'center', marginTop: 100 }}>{name}</Text>
);

export default function MainNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="HomeTab" options={{ title: 'Home' }}>
        {() => <PlaceholderScreen name="Dashboard" />}
      </Tab.Screen>
      <Tab.Screen name="HealthTab" options={{ title: 'Health' }}>
        {() => <PlaceholderScreen name="Health" />}
      </Tab.Screen>
      <Tab.Screen name="VaultTab" options={{ title: 'Vault' }}>
        {() => <PlaceholderScreen name="Vault" />}
      </Tab.Screen>
      <Tab.Screen name="ManageTab" options={{ title: 'Manage' }}>
        {() => <PlaceholderScreen name="Manage" />}
      </Tab.Screen>
      <Tab.Screen name="ProfileTab" options={{ title: 'Profile' }}>
        {() => <PlaceholderScreen name="Profile" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

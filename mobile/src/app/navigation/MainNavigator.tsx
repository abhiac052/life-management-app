import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { View, Text } from 'react-native';
import ProfileStack from './ProfileStack';
import RemindersStack from './RemindersStack';
import VaultStack from './VaultStack';
import MedicinesStack from './MedicinesStack';
import ManageStack from './ManageStack';
import HomeStack from './HomeStack';

const Tab = createBottomTabNavigator<MainTabParamList>();

const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>{name}</Text>
  </View>
);

export default function MainNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home', headerShown: false }} />
      <Tab.Screen name="HealthTab" component={MedicinesStack} options={{ title: 'Health', headerShown: false }} />
      <Tab.Screen name="VaultTab" component={VaultStack} options={{ title: 'Vault', headerShown: false }} />
      <Tab.Screen name="ManageTab" component={ManageStack} options={{ title: 'Records', headerShown: false }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Profile', headerShown: false }} />
    </Tab.Navigator>
  );
}

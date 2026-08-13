import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { Text, View } from 'react-native';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator<MainTabParamList>();

const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>{name}</Text>
  </View>
);

export default function MainNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="HomeTab" options={{ title: 'Home', headerShown: false }}>
        {() => <PlaceholderScreen name="Dashboard" />}
      </Tab.Screen>
      <Tab.Screen name="HealthTab" options={{ title: 'Health', headerShown: false }}>
        {() => <PlaceholderScreen name="Health" />}
      </Tab.Screen>
      <Tab.Screen name="VaultTab" options={{ title: 'Vault', headerShown: false }}>
        {() => <PlaceholderScreen name="Vault" />}
      </Tab.Screen>
      <Tab.Screen name="ManageTab" options={{ title: 'Manage', headerShown: false }}>
        {() => <PlaceholderScreen name="Manage" />}
      </Tab.Screen>
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Profile', headerShown: false }} />
    </Tab.Navigator>
  );
}

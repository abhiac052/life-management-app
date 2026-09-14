import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import ProfileStack from './ProfileStack';
import VaultStack from './VaultStack';
import MedicinesStack from './MedicinesStack';
import ManageStack from './ManageStack';
import HomeStack from './HomeStack';
import { Icon } from '../../shared/components/Icon';
import { radius, spacing } from '../../shared/theme';
import { useTheme } from '../../shared/theme/ThemeContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TABS: { name: keyof MainTabParamList; label: string; icon: string; activeIcon: string }[] = [
  { name: 'HomeTab',    label: 'Home',    icon: 'home-outline',      activeIcon: 'home' },
  { name: 'HealthTab',  label: 'Health',  icon: 'pill',              activeIcon: 'pill' },
  { name: 'VaultTab',   label: 'Vault',   icon: 'folder-outline',    activeIcon: 'folder' },
  { name: 'ManageTab',  label: 'Records', icon: 'view-grid-outline', activeIcon: 'view-grid' },
  { name: 'ProfileTab', label: 'Profile', icon: 'account-outline',   activeIcon: 'account' },
];

function TabItem({ tab, focused, onPress }: { tab: typeof TABS[0]; focused: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1.08 : 1,
        tension: 120, friction: 8, useNativeDriver: true,
      }),
      Animated.timing(indicatorWidth, {
        toValue: focused ? 1 : 0,
        duration: 200, useNativeDriver: false,
      }),
    ]).start();
  }, [focused]);

  return (
    <TouchableOpacity style={styles.tabBtn} onPress={onPress} activeOpacity={0.7}>
      <Animated.View style={[styles.tabInner, { transform: [{ scale }] }]}>
        <View style={[styles.iconWrap, focused && { backgroundColor: colors.primaryGlow }]}>
          <Icon
            name={focused ? tab.activeIcon : tab.icon}
            size={20}
            color={focused ? colors.primary : colors.textDisabled}
          />
        </View>
        <Text
          style={[styles.tabLabel, { color: focused ? colors.primary : colors.textDisabled }, focused && styles.tabLabelActive]}
          numberOfLines={1}
        >
          {tab.label}
        </Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.indicator,
          { backgroundColor: colors.primary },
          { width: indicatorWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '60%'] }) },
        ]}
      />
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.tabBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {state.routes.map((route, index) => {
        const tab = TABS.find((t) => t.name === route.name)!;
        const focused = state.index === index;
        return (
          <TabItem
            key={route.key}
            tab={tab}
            focused={focused}
            onPress={() => navigation.navigate(route.name)}
          />
        );
      })}
    </View>
  );
}

const STACK_MAP: Record<string, React.ComponentType<any>> = {
  HomeTab: HomeStack,
  HealthTab: MedicinesStack,
  VaultTab: VaultStack,
  ManageTab: ManageStack,
  ProfileTab: ProfileStack,
};

export default function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {TABS.map((t) => (
        <Tab.Screen key={t.name} name={t.name} component={STACK_MAP[t.name]} />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? 20 : spacing.sm,
    paddingTop: spacing.sm,
    height: Platform.OS === 'ios' ? 82 : 64,
  },
  tabBtn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 2 },
  tabInner: { alignItems: 'center', justifyContent: 'center', gap: 3 },
  iconWrap: { width: 36, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  tabLabel: { fontSize: 10, fontWeight: '500', letterSpacing: 0.2 },
  tabLabelActive: { fontWeight: '700' },
  indicator: { height: 3, borderRadius: radius.full, marginTop: 4, alignSelf: 'center' },
});

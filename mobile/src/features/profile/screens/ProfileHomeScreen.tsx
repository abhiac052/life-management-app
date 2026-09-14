import React from 'react';
import { ActivityIndicator, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProfile } from '../hooks/useProfile';
import { useLogout } from '../../auth/hooks/useAuth';
import { Icon } from '../../../shared/components/Icon';
import { spacing, typography, radius, shadows } from '../../../shared/theme';
import { useTheme } from '../../../shared/theme/ThemeContext';
import type { ProfileStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

export function ProfileHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { data: profile, isLoading } = useProfile();
  const { logout } = useLogout();
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();

  const MENU_ITEMS = [
    { label: 'Edit Profile',           screen: 'EditProfile' as const,           icon: 'account-edit-outline',  color: colors.primary },
    { label: 'Health Profile',         screen: 'HealthProfile' as const,         icon: 'heart-pulse',           color: colors.accent },
    { label: 'Change Password',        screen: 'ChangePassword' as const,        icon: 'lock-reset',            color: colors.info },
    { label: 'Notification Settings',  screen: 'NotificationSettings' as const,  icon: 'bell-badge-outline',    color: colors.warning },
    { label: 'Delete Account',         screen: 'DeleteAccount' as const,         icon: 'account-remove-outline',color: colors.error },
  ];

  if (isLoading) return (
    <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );

  const initials = profile?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? '?';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <StatusBar barStyle={colors.statusBar} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Profile hero */}
        <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatarRing, { borderColor: colors.primary + '60', backgroundColor: colors.primaryGlow }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{profile?.name}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{profile?.email}</Text>
          {profile?.phone && (
            <View style={[styles.phonePill, { backgroundColor: colors.backgroundSecondary }]}>
              <Icon name="phone-outline" size={12} color={colors.textSecondary} />
              <Text style={[styles.phoneText, { color: colors.textSecondary }]}>{profile.phone}</Text>
            </View>
          )}
        </View>

        {/* Appearance */}
        <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.menuItem, { borderBottomWidth: 0 }]}>
            <View style={[styles.menuIconBox, { backgroundColor: (isDark ? '#5856D6' : '#5856D6') + '18' }]}>
              <Icon name={isDark ? 'weather-night' : 'weather-sunny'} size={18} color="#5856D6" />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={isDark ? colors.primary : colors.surface}
            />
          </View>
        </View>

        {/* Menu */}
        <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.screen}
              style={[styles.menuItem, i < MENU_ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: item.color + '18' }]}>
                <Icon name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={[styles.menuLabel, { color: item.screen === 'DeleteAccount' ? colors.error : colors.text }]}>
                {item.label}
              </Text>
              <Icon name="chevron-right" size={18} color={colors.textDisabled} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.errorLight, borderColor: colors.error + '30' }]}
          onPress={() => { void logout(); }}
          activeOpacity={0.7}
        >
          <Icon name="logout-variant" size={18} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },

  hero: {
    alignItems: 'center', paddingVertical: spacing.xl,
    borderRadius: radius.xl, borderWidth: 1, ...shadows.md,
  },
  avatarRing: {
    width: 92, height: 92, borderRadius: 46, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  avatar: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.h2, color: '#FFFFFF', fontWeight: '800' },
  name:  { ...typography.h3, marginBottom: spacing.xs },
  email: { ...typography.body },
  phonePill: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginTop: spacing.sm,
  },
  phoneText: { ...typography.bodySmall },

  menuCard: { borderRadius: radius.xl, borderWidth: 1, overflow: 'hidden', ...shadows.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  menuIconBox: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { ...typography.body, flex: 1 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1,
  },
  logoutText: { ...typography.button },
});

import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProfile } from '../hooks/useProfile';
import { useLogout } from '../../auth/hooks/useAuth';
import { Icon } from '../../../shared/components/Icon';
import { colors, spacing, typography, radius, shadows } from '../../../shared/theme';
import type { ProfileStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const MENU_ITEMS = [
  { label: 'Edit Profile', screen: 'EditProfile' as const, icon: 'account-edit-outline', color: colors.primary },
  { label: 'Health Profile', screen: 'HealthProfile' as const, icon: 'heart-pulse', color: colors.accent },
  { label: 'Change Password', screen: 'ChangePassword' as const, icon: 'lock-reset', color: colors.info },
  { label: 'Notification Settings', screen: 'NotificationSettings' as const, icon: 'bell-badge-outline', color: colors.warning },
  { label: 'Delete Account', screen: 'DeleteAccount' as const, icon: 'account-remove-outline', color: colors.error },
];

export function ProfileHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { data: profile, isLoading } = useProfile();
  const { logout } = useLogout();

  if (isLoading) return (
    <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );

  const initials = profile?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() ?? '?';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Profile hero */}
        <View style={styles.hero}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
          <Text style={styles.name}>{profile?.name}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
          {profile?.phone && (
            <View style={styles.phonePill}>
              <Icon name="phone-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.phoneText}>{profile.phone}</Text>
            </View>
          )}
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.screen}
              style={[styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuBorder]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: item.color + '18' }]}>
                <Icon name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={[styles.menuLabel, item.screen === 'DeleteAccount' && styles.danger]}>
                {item.label}
              </Text>
              <Icon name="chevron-right" size={18} color={colors.textDisabled} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={() => { void logout(); }} activeOpacity={0.7}>
          <Icon name="logout-variant" size={18} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },

  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  avatarRing: {
    width: 92, height: 92, borderRadius: 46,
    borderWidth: 2, borderColor: colors.primary + '60',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.primaryGlow,
  },
  avatar: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { ...typography.h2, color: colors.white, fontWeight: '800' },
  name: { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  email: { ...typography.body, color: colors.textSecondary },
  phonePill: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.surfaceElevated, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginTop: spacing.sm,
  },
  phoneText: { ...typography.bodySmall, color: colors.textSecondary },

  menuCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.md, padding: spacing.md,
  },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  menuIconBox: {
    width: 36, height: 36, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { ...typography.body, color: colors.text, flex: 1 },
  danger: { color: colors.error },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, padding: spacing.md,
    backgroundColor: colors.errorLight, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.error + '30',
  },
  logoutText: { ...typography.button, color: colors.error },
});

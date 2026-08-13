import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProfile } from '../hooks/useProfile';
import { useLogout } from '../../auth/hooks/useAuth';
import { Card } from '../../../shared/components/Card';
import { colors, spacing, typography } from '../../../shared/theme';
import type { ProfileStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

export function ProfileHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { data: profile, isLoading } = useProfile();
  const { logout } = useLogout();

  if (isLoading) return <ActivityIndicator style={styles.loader} color={colors.primary} />;

  const menuItems = [
    { label: 'Edit Profile', screen: 'EditProfile' as const },
    { label: 'Change Password', screen: 'ChangePassword' as const },
    { label: 'Notification Settings', screen: 'NotificationSettings' as const },
    { label: 'Delete Account', screen: 'DeleteAccount' as const },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.name?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.name}>{profile?.name}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
        {profile?.phone && <Text style={styles.phone}>{profile.phone}</Text>}
      </Card>

      <Card style={styles.menuCard}>
        {menuItems.map((item, i) => (
          <TouchableOpacity
            key={item.screen}
            style={[styles.menuItem, i < menuItems.length - 1 && styles.menuBorder]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={[styles.menuLabel, item.screen === 'DeleteAccount' && styles.danger]}>
              {item.label}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </Card>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => { void logout(); }}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  loader: { flex: 1 },
  profileCard: { alignItems: 'center', paddingVertical: spacing.xl },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { ...typography.h2, color: '#fff' },
  name: { ...typography.h3, color: colors.text },
  email: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  phone: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  menuCard: { padding: 0, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  menuLabel: { ...typography.body, color: colors.text },
  danger: { color: colors.error },
  chevron: { fontSize: 20, color: colors.textDisabled },
  logoutBtn: { alignItems: 'center', padding: spacing.md },
  logoutText: { ...typography.button, color: colors.error },
});

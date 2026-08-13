import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { usePreferences, useUpdatePreferences } from '../hooks/useProfile';
import { Card } from '../../../shared/components/Card';
import { colors, spacing, typography } from '../../../shared/theme';
import type { UserPreferences } from '../services/profile.service';

type BoolKey = keyof Pick<UserPreferences,
  'notificationsEnabled' | 'medicinePush' | 'appointmentPush' |
  'reminderPush' | 'warrantyPush' | 'vehiclePush' | 'documentPush' | 'quietHoursEnabled'>;

const SETTINGS: { key: BoolKey; label: string }[] = [
  { key: 'notificationsEnabled', label: 'All Notifications' },
  { key: 'medicinePush', label: 'Medicine Reminders' },
  { key: 'appointmentPush', label: 'Appointments' },
  { key: 'reminderPush', label: 'Reminders' },
  { key: 'warrantyPush', label: 'Warranty Expiry' },
  { key: 'vehiclePush', label: 'Vehicle Dates' },
  { key: 'documentPush', label: 'Document Expiry' },
  { key: 'quietHoursEnabled', label: 'Quiet Hours' },
];

export function NotificationSettingsScreen() {
  const { data: prefs, isLoading } = usePreferences();
  const { mutate } = useUpdatePreferences();

  if (isLoading || !prefs) return <ActivityIndicator style={styles.loader} color={colors.primary} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        {SETTINGS.map((item, i) => (
          <View key={item.key} style={[styles.row, i < SETTINGS.length - 1 && styles.border]}>
            <Text style={styles.label}>{item.label}</Text>
            <Switch
              value={prefs[item.key] as boolean}
              onValueChange={val => mutate({ [item.key]: val })}
              trackColor={{ true: colors.primary }}
            />
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  loader: { flex: 1 },
  card: { padding: 0, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md },
  border: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  label: { ...typography.body, color: colors.text },
});

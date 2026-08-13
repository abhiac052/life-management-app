import React from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useReminderDetail, useReminderActions, useDeleteReminder } from '../hooks/useReminders';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { colors, spacing, typography } from '../../../shared/theme';
import type { RemindersStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RemindersStackParamList>;
type Route = RouteProp<RemindersStackParamList, 'ReminderDetail'>;

export function ReminderDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { data: reminder, isLoading } = useReminderDetail(params.id);
  const { complete, skip, snooze, pause, resume } = useReminderActions();
  const { mutate: deleteReminder } = useDeleteReminder();

  if (isLoading || !reminder) return <ActivityIndicator style={styles.loader} color={colors.primary} />;

  const isActive = reminder.status === 'ACTIVE';
  const due = new Date(reminder.dueDate);

  const handleDelete = () => {
    Alert.alert('Delete Reminder', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteReminder(reminder.id); navigation.goBack(); } },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.title}>{reminder.title}</Text>
        {reminder.description && <Text style={styles.desc}>{reminder.description}</Text>}
        <View style={styles.meta}>
          <MetaRow label="Due" value={`${due.toLocaleDateString()} ${due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} />
          <MetaRow label="Recurrence" value={reminder.recurrenceType} />
          {reminder.category && <MetaRow label="Category" value={reminder.category} />}
          <MetaRow label="Status" value={reminder.status} />
          {reminder.snoozedUntil && <MetaRow label="Snoozed until" value={new Date(reminder.snoozedUntil).toLocaleTimeString()} />}
        </View>
      </Card>

      {isActive && (
        <View style={styles.actions}>
          <Button title="Complete" onPress={() => { complete.mutate(reminder.id); navigation.goBack(); }} />
          <Button title="Skip" variant="outline" onPress={() => { skip.mutate(reminder.id); navigation.goBack(); }} />
          <Button title="Snooze 1h" variant="outline" onPress={() => snooze.mutate({ id: reminder.id, duration: 60 })} />
          <Button title="Pause" variant="ghost" onPress={() => pause.mutate(reminder.id)} />
        </View>
      )}

      {reminder.status === 'PAUSED' && (
        <Button title="Resume" onPress={() => resume.mutate(reminder.id)} />
      )}

      <View style={styles.bottomActions}>
        <Button title="Edit" variant="outline" onPress={() => navigation.navigate('EditReminder', { id: reminder.id })} />
        <Button title="Delete" variant="danger" onPress={handleDelete} />
      </View>
    </ScrollView>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  loader: { flex: 1 },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  desc: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md },
  meta: { gap: spacing.sm },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaLabel: { ...typography.bodySmall, color: colors.textSecondary },
  metaValue: { ...typography.bodySmall, color: colors.text, fontWeight: '500' },
  actions: { gap: spacing.sm },
  bottomActions: { flexDirection: 'row', gap: spacing.sm },
});

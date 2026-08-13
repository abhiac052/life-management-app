import React, { useState } from 'react';
import {
  FlatList, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useReminders } from '../hooks/useReminders';
import { EmptyState, LoadingSkeleton } from '../../../shared/components/Card';
import { colors, spacing, typography } from '../../../shared/theme';
import type { RemindersStackParamList } from '../../../app/navigation/types';
import type { Reminder } from '../services/reminders.service';

type Nav = NativeStackNavigationProp<RemindersStackParamList>;

const STATUS_FILTERS = ['ACTIVE', 'PAUSED', 'EXPIRED', 'CANCELLED'];

export function ReminderListScreen() {
  const navigation = useNavigation<Nav>();
  const [status, setStatus] = useState<string>('ACTIVE');
  const { data, isLoading } = useReminders(status);

  return (
    <View style={styles.container}>
      {/* Filter tabs */}
      <View style={styles.filters}>
        {STATUS_FILTERS.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.filterBtn, status === s && styles.filterActive]}
            onPress={() => setStatus(s)}
          >
            <Text style={[styles.filterText, status === s && styles.filterTextActive]}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.skeletons}>
          {[1, 2, 3].map(i => <LoadingSkeleton key={i} height={72} style={styles.skeleton} />)}
        </View>
      ) : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState title="No reminders" description="Tap + to create one" />}
          renderItem={({ item }) => <ReminderCard item={item} onPress={() => navigation.navigate('ReminderDetail', { id: item.id })} />}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateReminder')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function ReminderCard({ item, onPress }: { item: Reminder; onPress: () => void }) {
  const due = new Date(item.dueDate);
  const isOverdue = due < new Date() && item.status === 'ACTIVE';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardLeft}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.cardDate, isOverdue && styles.overdue]}>
          {isOverdue ? '⚠ Overdue · ' : ''}{due.toLocaleDateString()} {due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        {item.category && <Text style={styles.cardCategory}>{item.category}</Text>}
      </View>
      <Text style={styles.recurrence}>{item.recurrenceType}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filters: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  filterBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { ...typography.label, color: colors.textSecondary },
  filterTextActive: { color: '#fff' },
  list: { padding: spacing.md, gap: spacing.sm },
  skeletons: { padding: spacing.md, gap: spacing.sm },
  skeleton: { borderRadius: 10, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: 10, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLeft: { flex: 1 },
  cardTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  cardDate: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  overdue: { color: colors.error },
  cardCategory: { ...typography.label, color: colors.primary, marginTop: 4 },
  recurrence: { ...typography.label, color: colors.textDisabled, marginLeft: spacing.sm },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.lg, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
});

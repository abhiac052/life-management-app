import React from 'react';
import {
  FlatList, StyleSheet, Text, TouchableOpacity, View, Alert,
} from 'react-native';
import { useTodayDoses, useLogDose } from '../hooks/useMedicines';
import { EmptyState, LoadingSkeleton } from '../../../shared/components/Card';
import { colors, spacing, typography, radius } from '../../../shared/theme';
import type { TodayDose } from '../services/medicines.service';

const FORM_ICONS: Record<string, string> = {
  TABLET: '💊', CAPSULE: '💊', SYRUP: '🥄', INJECTION: '💉',
  DROPS: '💧', INHALER: '🫁', CREAM: '🧴', OTHER: '💊',
};

const STATUS_COLORS: Record<string, string> = {
  pending: colors.warning,
  taken: colors.success,
  skipped: colors.textDisabled,
  missed: colors.error,
};

export function TodayDosesScreen() {
  const { data: doses, isLoading, refetch } = useTodayDoses();
  const { mutate: logDose, isPending } = useLogDose();

  const handleAction = (dose: TodayDose, action: 'taken' | 'skipped') => {
    logDose({ scheduleId: dose.scheduleId, scheduledAt: dose.scheduledAt, action });
  };

  const confirmSkip = (dose: TodayDose) => {
    Alert.alert('Skip dose?', `Skip ${dose.medicineName} at ${dose.scheduleTime}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Skip', style: 'destructive', onPress: () => handleAction(dose, 'skipped') },
    ]);
  };

  const pending = doses?.filter((d) => d.status === 'pending').length ?? 0;
  const taken = doses?.filter((d) => d.status === 'taken').length ?? 0;

  return (
    <View style={styles.container}>
      {/* Summary bar */}
      {!isLoading && (doses?.length ?? 0) > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {taken}/{doses!.length} taken · {pending} pending
          </Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.skeletons}>
          {[1, 2, 3].map((i) => <LoadingSkeleton key={i} height={88} style={styles.skeleton} />)}
        </View>
      ) : (
        <FlatList
          data={doses ?? []}
          keyExtractor={(item) => `${item.scheduleId}-${item.scheduledAt}`}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={false}
          ListEmptyComponent={
            <EmptyState title="No doses today" description="Add medicines to see today's schedule" />
          }
          renderItem={({ item }) => (
            <DoseCard
              dose={item}
              onTake={() => handleAction(item, 'taken')}
              onSkip={() => confirmSkip(item)}
              disabled={isPending || item.status !== 'pending'}
            />
          )}
        />
      )}
    </View>
  );
}

function DoseCard({
  dose, onTake, onSkip, disabled,
}: {
  dose: TodayDose;
  onTake: () => void;
  onSkip: () => void;
  disabled: boolean;
}) {
  const icon = FORM_ICONS[dose.form] ?? '💊';
  const statusColor = STATUS_COLORS[dose.status] ?? colors.textDisabled;
  const time = dose.scheduleTime;
  const label = dose.scheduleLabel ?? time;
  const lowStock = dose.stock && dose.stock.currentQty <= dose.stock.refillThreshold;

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.medicineName}>{dose.medicineName}</Text>
          {lowStock && <Text style={styles.lowStock}>⚠ Low stock</Text>}
        </View>
        <Text style={styles.dosage}>{dose.dosage} · {label}</Text>
        <Text style={styles.mealRelation}>{dose.mealRelation.replace('_', ' ')}</Text>
      </View>
      <View style={styles.cardRight}>
        {dose.status === 'pending' ? (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.takeBtn} onPress={onTake} disabled={disabled}>
              <Text style={styles.takeBtnText}>✓</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipBtn} onPress={onSkip} disabled={disabled}>
              <Text style={styles.skipBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {dose.status.charAt(0).toUpperCase() + dose.status.slice(1)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  summary: { backgroundColor: colors.primary, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  summaryText: { ...typography.bodySmall, color: '#fff', textAlign: 'center' },
  list: { padding: spacing.md, gap: spacing.sm },
  skeletons: { padding: spacing.md, gap: spacing.sm },
  skeleton: { borderRadius: radius.md, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
  },
  cardLeft: { width: 36, alignItems: 'center' },
  icon: { fontSize: 24 },
  cardBody: { flex: 1 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  medicineName: { ...typography.body, color: colors.text, fontWeight: '600', flex: 1 },
  lowStock: { ...typography.label, color: colors.warning },
  dosage: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  mealRelation: { ...typography.label, color: colors.textDisabled, marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  actions: { flexDirection: 'row', gap: spacing.xs },
  takeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center',
  },
  takeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  skipBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  skipBtnText: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full },
  statusText: { ...typography.label, fontWeight: '600' },
});

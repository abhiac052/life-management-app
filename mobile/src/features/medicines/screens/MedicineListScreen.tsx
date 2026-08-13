import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMedicines } from '../hooks/useMedicines';
import { EmptyState, LoadingSkeleton } from '../../../shared/components/Card';
import { colors, spacing, typography, radius } from '../../../shared/theme';
import type { MedicinesStackParamList } from '../../../app/navigation/types';
import type { Medicine } from '../services/medicines.service';

type Nav = NativeStackNavigationProp<MedicinesStackParamList>;

const FORM_ICONS: Record<string, string> = {
  TABLET: '💊', CAPSULE: '💊', SYRUP: '🥄', INJECTION: '💉',
  DROPS: '💧', INHALER: '🫁', CREAM: '🧴', OTHER: '💊',
};

export function MedicineListScreen() {
  const navigation = useNavigation<Nav>();
  const [showInactive, setShowInactive] = useState(false);
  const { data, isLoading, refetch } = useMedicines(showInactive ? undefined : true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.toggle, !showInactive && styles.toggleActive]}
          onPress={() => setShowInactive(false)}
        >
          <Text style={[styles.toggleText, !showInactive && styles.toggleTextActive]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggle, showInactive && styles.toggleActive]}
          onPress={() => setShowInactive(true)}
        >
          <Text style={[styles.toggleText, showInactive && styles.toggleTextActive]}>All</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.skeletons}>
          {[1, 2, 3].map((i) => <LoadingSkeleton key={i} height={80} style={styles.skeleton} />)}
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={false}
          ListEmptyComponent={<EmptyState title="No medicines" description="Tap + to add a medicine" />}
          renderItem={({ item }) => (
            <MedicineCard
              item={item}
              onPress={() => navigation.navigate('MedicineDetail', { id: item.id })}
            />
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateMedicine')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function MedicineCard({ item, onPress }: { item: Medicine; onPress: () => void }) {
  const icon = FORM_ICONS[item.form] ?? '💊';
  const scheduleCount = item.schedules.length;
  const lowStock = item.stock && item.stock.currentQty <= item.stock.refillThreshold;

  return (
    <TouchableOpacity style={[styles.card, !item.isActive && styles.cardInactive]} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          {!item.isActive && <Text style={styles.inactiveBadge}>Inactive</Text>}
          {lowStock && <Text style={styles.lowStockBadge}>⚠ Refill</Text>}
        </View>
        <Text style={styles.cardDosage}>{item.dosage} · {item.form.toLowerCase()}</Text>
        <Text style={styles.cardSchedule}>
          {scheduleCount > 0 ? `${scheduleCount} schedule${scheduleCount > 1 ? 's' : ''}` : 'No schedule'}
          {item.stock ? ` · ${item.stock.currentQty} units left` : ''}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm },
  toggle: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radius.full, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  toggleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleText: { ...typography.label, color: colors.textSecondary },
  toggleTextActive: { color: '#fff' },
  list: { padding: spacing.md, gap: spacing.sm },
  skeletons: { padding: spacing.md, gap: spacing.sm },
  skeleton: { borderRadius: radius.md, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
  },
  cardInactive: { opacity: 0.6 },
  cardIcon: { fontSize: 28, width: 36, textAlign: 'center' },
  cardBody: { flex: 1 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  cardName: { ...typography.body, color: colors.text, fontWeight: '600', flex: 1 },
  inactiveBadge: { ...typography.label, color: colors.textDisabled, backgroundColor: colors.divider, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  lowStockBadge: { ...typography.label, color: colors.warning },
  cardDosage: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  cardSchedule: { ...typography.label, color: colors.textDisabled, marginTop: 2 },
  chevron: { fontSize: 20, color: colors.textDisabled },
  fab: {
    position: 'absolute', bottom: spacing.xl, right: spacing.lg,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
});

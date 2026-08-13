import React, { useState } from 'react';
import {
  Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import {
  useMedicineDetail, useMedicineAdherence, useDeleteMedicine,
  useDeactivateMedicine, useUpsertStock,
} from '../hooks/useMedicines';
import { LoadingSkeleton } from '../../../shared/components/Card';
import { colors, spacing, typography, radius } from '../../../shared/theme';
import type { MedicinesStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<MedicinesStackParamList>;
type Route = RouteProp<MedicinesStackParamList, 'MedicineDetail'>;

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function MedicineDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { data: medicine, isLoading } = useMedicineDetail(params.id);
  const { data: adherence } = useMedicineAdherence(params.id);
  const { mutate: deleteMedicine } = useDeleteMedicine();
  const { mutate: deactivate } = useDeactivateMedicine();
  const { mutate: upsertStock } = useUpsertStock(params.id);

  const [stockQty, setStockQty] = useState('');
  const [showStockEdit, setShowStockEdit] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.container}>
        {[1, 2, 3].map((i) => <LoadingSkeleton key={i} height={80} style={styles.skeleton} />)}
      </View>
    );
  }

  if (!medicine) return null;

  const handleDelete = () => {
    Alert.alert('Delete medicine?', 'This will also delete all dose logs and reminders.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => {
          deleteMedicine(medicine.id, { onSuccess: () => navigation.goBack() });
        },
      },
    ]);
  };

  const handleDeactivate = () => {
    Alert.alert('Stop medicine?', 'Mark this medicine as inactive?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Stop', onPress: () => deactivate(medicine.id) },
    ]);
  };

  const handleStockSave = () => {
    const qty = parseInt(stockQty, 10);
    if (isNaN(qty) || qty < 0) return;
    upsertStock(
      { currentQty: qty, unitsPerDose: medicine.stock?.unitsPerDose, dosesPerDay: medicine.stock?.dosesPerDay, refillThreshold: medicine.stock?.refillThreshold },
      { onSuccess: () => setShowStockEdit(false) },
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerCard}>
        <Text style={styles.name}>{medicine.name}</Text>
        <Text style={styles.dosage}>{medicine.dosage} · {medicine.form.toLowerCase()}</Text>
        <Text style={styles.meal}>{medicine.mealRelation.replace(/_/g, ' ')}</Text>
        {!medicine.isActive && (
          <View style={styles.inactiveBanner}>
            <Text style={styles.inactiveBannerText}>Inactive</Text>
          </View>
        )}
      </View>

      {/* Adherence */}
      {adherence && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>30-Day Adherence</Text>
          <View style={styles.adherenceRow}>
            <AdherenceStat label="Taken" value={adherence.taken} color={colors.success} />
            <AdherenceStat label="Skipped" value={adherence.skipped} color={colors.warning} />
            <AdherenceStat label="Missed" value={adherence.missed} color={colors.error} />
            <AdherenceStat
              label="Rate"
              value={adherence.adherencePercent !== null ? `${adherence.adherencePercent}%` : '—'}
              color={colors.primary}
            />
          </View>
        </View>
      )}

      {/* Schedules */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Schedules</Text>
        {medicine.schedules.length === 0 ? (
          <Text style={styles.emptyText}>No schedules set</Text>
        ) : (
          medicine.schedules.map((s) => (
            <View key={s.id} style={styles.scheduleRow}>
              <Text style={styles.scheduleTime}>{s.label ?? s.time}</Text>
              <Text style={styles.scheduleTime}>{s.time}</Text>
              <Text style={styles.scheduleDays}>
                {s.daysOfWeek.length === 0 ? 'Every day' : s.daysOfWeek.map((d) => DAYS[d - 1]).join(', ')}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Stock */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Stock</Text>
          <TouchableOpacity onPress={() => { setStockQty(String(medicine.stock?.currentQty ?? '')); setShowStockEdit(true); }}>
            <Text style={styles.editLink}>Update</Text>
          </TouchableOpacity>
        </View>
        {medicine.stock ? (
          <View style={styles.stockRow}>
            <Text style={styles.stockQty}>{medicine.stock.currentQty}</Text>
            <Text style={styles.stockLabel}> units · refill at {medicine.stock.refillThreshold}</Text>
            {medicine.stock.currentQty <= medicine.stock.refillThreshold && (
              <Text style={styles.lowStockWarning}> ⚠ Refill needed</Text>
            )}
          </View>
        ) : (
          <Text style={styles.emptyText}>No stock tracking</Text>
        )}
        {showStockEdit && (
          <View style={styles.stockEdit}>
            <TextInput
              style={styles.stockInput}
              value={stockQty}
              onChangeText={setStockQty}
              keyboardType="number-pad"
              placeholder="New quantity"
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleStockSave}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowStockEdit(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Notes */}
      {(medicine.instructions || medicine.notes) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          {medicine.instructions && <Text style={styles.noteText}>{medicine.instructions}</Text>}
          {medicine.notes && <Text style={styles.noteText}>{medicine.notes}</Text>}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('EditMedicine', { id: medicine.id })}
        >
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        {medicine.isActive && (
          <TouchableOpacity style={styles.deactivateBtn} onPress={handleDeactivate}>
            <Text style={styles.deactivateBtnText}>Stop</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function AdherenceStat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <View style={styles.adherenceStat}>
      <Text style={[styles.adherenceValue, { color }]}>{value}</Text>
      <Text style={styles.adherenceLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  skeleton: { borderRadius: radius.md, marginBottom: spacing.sm, margin: spacing.md },
  headerCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md },
  name: { ...typography.h2, color: colors.text },
  dosage: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  meal: { ...typography.bodySmall, color: colors.textDisabled, marginTop: 2 },
  inactiveBanner: { marginTop: spacing.sm, backgroundColor: colors.divider, borderRadius: radius.sm, padding: spacing.xs, alignSelf: 'flex-start' },
  inactiveBannerText: { ...typography.label, color: colors.textSecondary },
  section: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  editLink: { ...typography.bodySmall, color: colors.primary },
  adherenceRow: { flexDirection: 'row', justifyContent: 'space-around' },
  adherenceStat: { alignItems: 'center' },
  adherenceValue: { ...typography.h2 },
  adherenceLabel: { ...typography.label, color: colors.textSecondary, marginTop: 2 },
  scheduleRow: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.divider },
  scheduleTime: { ...typography.body, color: colors.text, fontWeight: '600', minWidth: 60 },
  scheduleDays: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  emptyText: { ...typography.bodySmall, color: colors.textDisabled },
  stockRow: { flexDirection: 'row', alignItems: 'center' },
  stockQty: { ...typography.h2, color: colors.text },
  stockLabel: { ...typography.body, color: colors.textSecondary },
  lowStockWarning: { ...typography.bodySmall, color: colors.warning },
  stockEdit: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  stockInput: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.sm, ...typography.body },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  saveBtnText: { ...typography.button, color: '#fff' },
  cancelText: { ...typography.bodySmall, color: colors.textSecondary },
  noteText: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm },
  editBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  editBtnText: { ...typography.button, color: '#fff' },
  deactivateBtn: { flex: 1, backgroundColor: colors.warning + '20', borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  deactivateBtnText: { ...typography.button, color: colors.warning },
  deleteBtn: { flex: 1, backgroundColor: colors.error + '20', borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  deleteBtnText: { ...typography.button, color: colors.error },
});

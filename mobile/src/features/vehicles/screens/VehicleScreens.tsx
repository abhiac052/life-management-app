import React, { useState } from 'react';
import {
  Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useVehicles, useVehicleDetail, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from '../hooks/useVehicles';
import { EmptyState, LoadingSkeleton } from '../../../shared/components/Card';
import { colors, spacing, typography, radius } from '../../../shared/theme';
import type { ManageStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<ManageStackParamList>;

const VEHICLE_TYPES = ['CAR', 'BIKE', 'SCOOTER', 'OTHER'];
const VEHICLE_ICONS: Record<string, string> = { CAR: '🚗', BIKE: '🏍️', SCOOTER: '🛵', OTHER: '🚘' };

function daysUntil(dateStr: string | null) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function StatusDot({ dateStr }: { dateStr: string | null }) {
  if (!dateStr) return null;
  const days = daysUntil(dateStr)!;
  const color = days < 0 ? colors.error : days <= 30 ? colors.warning : colors.success;
  return <View style={[styles.dot, { backgroundColor: color }]} />;
}

export function VehicleListScreen() {
  const navigation = useNavigation<Nav>();
  const { data, isLoading, refetch } = useVehicles();

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.skeletons}>{[1, 2, 3].map((i) => <LoadingSkeleton key={i} height={80} style={styles.skeleton} />)}</View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={false}
          ListEmptyComponent={<EmptyState title="No vehicles" description="Tap + to add a vehicle" />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('VehicleDetail', { id: item.id })} activeOpacity={0.8}>
              <Text style={styles.cardIcon}>{VEHICLE_ICONS[item.type] ?? '🚘'}</Text>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                {item.registrationNo && <Text style={styles.cardSub}>{item.registrationNo}</Text>}
                <View style={styles.dotsRow}>
                  {item.insuranceExpiry && <><StatusDot dateStr={item.insuranceExpiry} /><Text style={styles.dotLabel}>Insurance</Text></>}
                  {item.pucExpiry && <><StatusDot dateStr={item.pucExpiry} /><Text style={styles.dotLabel}>PUC</Text></>}
                  {item.nextServiceDate && <><StatusDot dateStr={item.nextServiceDate} /><Text style={styles.dotLabel}>Service</Text></>}
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateVehicle')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

export function VehicleDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<ManageStackParamList, 'VehicleDetail'>>();
  const { data: v, isLoading } = useVehicleDetail(params.id);
  const { mutate: deleteVehicle } = useDeleteVehicle();

  if (isLoading) return <View style={styles.container}><LoadingSkeleton height={200} style={styles.skeleton} /></View>;
  if (!v) return null;

  const handleDelete = () => {
    Alert.alert('Delete vehicle?', 'All linked reminders will also be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteVehicle(v.id, { onSuccess: () => navigation.goBack() }) },
    ]);
  };

  const dateRows = [
    { label: 'Insurance Expiry', date: v.insuranceExpiry },
    { label: 'PUC Expiry', date: v.pucExpiry },
    { label: 'Next Service', date: v.nextServiceDate },
  ].filter((r) => r.date);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.vehicleIcon}>{VEHICLE_ICONS[v.type] ?? '🚘'}</Text>
        <Text style={styles.name}>{v.name}</Text>
        <Text style={styles.sub}>{v.type.toLowerCase()}{v.registrationNo ? ` · ${v.registrationNo}` : ''}</Text>
        {v.notes && <Text style={styles.notes}>{v.notes}</Text>}
      </View>

      {dateRows.length > 0 && (
        <View style={styles.datesCard}>
          {dateRows.map(({ label, date }) => {
            const days = daysUntil(date);
            const color = days === null ? colors.textDisabled : days < 0 ? colors.error : days <= 30 ? colors.warning : colors.success;
            const daysLabel = days === null ? '' : days < 0 ? 'Expired' : days === 0 ? 'Today' : `${days} days left`;
            return (
              <View key={label} style={styles.dateRow}>
                <Text style={styles.dateLabel}>{label}</Text>
                <Text style={styles.dateValue}>{new Date(date!).toLocaleDateString()}</Text>
                <Text style={[styles.daysLeft, { color }]}>{daysLabel}</Text>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditVehicle', { id: v.id })}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export function CreateVehicleScreen() {
  const navigation = useNavigation<Nav>();
  const { mutate: create, isPending } = useCreateVehicle();
  const [fields, setFields] = useState({ name: '', type: 'CAR', registrationNo: '', insuranceExpiry: '', pucExpiry: '', nextServiceDate: '', notes: '' });
  const set = (k: keyof typeof fields) => (v: string) => setFields((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!fields.name.trim()) { Alert.alert('Required', 'Vehicle name is required'); return; }
    create({
      name: fields.name.trim(), type: fields.type,
      registrationNo: fields.registrationNo || undefined,
      insuranceExpiry: fields.insuranceExpiry || undefined,
      pucExpiry: fields.pucExpiry || undefined,
      nextServiceDate: fields.nextServiceDate || undefined,
      notes: fields.notes || undefined,
    }, { onSuccess: () => navigation.goBack() });
  };

  return <VehicleForm fields={fields} set={set} onSubmit={handleSubmit} isPending={isPending} submitLabel="Add Vehicle" />;
}

export function EditVehicleScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<ManageStackParamList, 'EditVehicle'>>();
  const { data: v } = useVehicleDetail(params.id);
  const { mutate: update, isPending } = useUpdateVehicle(params.id);
  const [fields, setFields] = useState({ name: '', type: 'CAR', registrationNo: '', insuranceExpiry: '', pucExpiry: '', nextServiceDate: '', notes: '' });
  const set = (k: keyof typeof fields) => (v: string) => setFields((f) => ({ ...f, [k]: v }));

  React.useEffect(() => {
    if (v) setFields({
      name: v.name, type: v.type, registrationNo: v.registrationNo ?? '',
      insuranceExpiry: v.insuranceExpiry?.split('T')[0] ?? '',
      pucExpiry: v.pucExpiry?.split('T')[0] ?? '',
      nextServiceDate: v.nextServiceDate?.split('T')[0] ?? '',
      notes: v.notes ?? '',
    });
  }, [v?.id]);

  const handleSubmit = () => {
    update({
      name: fields.name.trim(), type: fields.type,
      registrationNo: fields.registrationNo || undefined,
      insuranceExpiry: fields.insuranceExpiry || undefined,
      pucExpiry: fields.pucExpiry || undefined,
      nextServiceDate: fields.nextServiceDate || undefined,
      notes: fields.notes || undefined,
    }, { onSuccess: () => navigation.goBack() });
  };

  return <VehicleForm fields={fields} set={set} onSubmit={handleSubmit} isPending={isPending} submitLabel="Save Changes" />;
}

type VehicleFields = { name: string; type: string; registrationNo: string; insuranceExpiry: string; pucExpiry: string; nextServiceDate: string; notes: string };

function VehicleForm({ fields, set, onSubmit, isPending, submitLabel }: {
  fields: VehicleFields;
  set: (k: keyof VehicleFields) => (v: string) => void;
  onSubmit: () => void; isPending: boolean; submitLabel: string;
}) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Name *</Text>
      <TextInput style={styles.input} value={fields.name} onChangeText={set('name')} placeholder="e.g. My Honda City" />

      <Text style={styles.label}>Type</Text>
      <View style={styles.chipRow}>
        {VEHICLE_TYPES.map((t) => (
          <TouchableOpacity key={t} style={[styles.chip, fields.type === t && styles.chipActive]} onPress={() => set('type')(t)}>
            <Text style={[styles.chipText, fields.type === t && styles.chipTextActive]}>{VEHICLE_ICONS[t]} {t.charAt(0) + t.slice(1).toLowerCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {[
        { key: 'registrationNo', label: 'Registration No', placeholder: 'MH01AB1234' },
        { key: 'insuranceExpiry', label: 'Insurance Expiry (YYYY-MM-DD)', placeholder: '2026-03-15' },
        { key: 'pucExpiry', label: 'PUC Expiry (YYYY-MM-DD)', placeholder: '2025-09-15' },
        { key: 'nextServiceDate', label: 'Next Service Date (YYYY-MM-DD)', placeholder: '2025-06-01' },
      ].map((f) => (
        <View key={f.key}>
          <Text style={styles.label}>{f.label}</Text>
          <TextInput style={styles.input} value={fields[f.key as keyof VehicleFields]} onChangeText={set(f.key as keyof VehicleFields)} placeholder={f.placeholder} />
        </View>
      ))}

      <Text style={styles.label}>Notes</Text>
      <TextInput style={[styles.input, styles.multiline]} value={fields.notes} onChangeText={set('notes')} multiline placeholder="Notes..." />

      <TouchableOpacity style={[styles.submitBtn, isPending && styles.submitBtnDisabled]} onPress={onSubmit} disabled={isPending}>
        <Text style={styles.submitBtnText}>{isPending ? 'Saving...' : submitLabel}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl },
  skeletons: { padding: spacing.md, gap: spacing.sm },
  skeleton: { borderRadius: radius.md, marginBottom: spacing.sm, margin: spacing.md },
  list: { padding: spacing.md, gap: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardIcon: { fontSize: 28 },
  cardBody: { flex: 1 },
  cardTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  cardSub: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotLabel: { ...typography.label, color: colors.textDisabled, marginRight: spacing.sm },
  chevron: { fontSize: 20, color: colors.textDisabled },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.lg, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
  headerCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', gap: spacing.xs },
  vehicleIcon: { fontSize: 48 },
  name: { ...typography.h2, color: colors.text },
  sub: { ...typography.body, color: colors.textSecondary },
  notes: { ...typography.bodySmall, color: colors.textDisabled, marginTop: spacing.xs },
  datesCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateLabel: { ...typography.body, color: colors.text, flex: 1 },
  dateValue: { ...typography.bodySmall, color: colors.textSecondary, marginRight: spacing.sm },
  daysLeft: { ...typography.label, fontWeight: '600', minWidth: 70, textAlign: 'right' },
  actions: { flexDirection: 'row', gap: spacing.sm },
  editBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  editBtnText: { ...typography.button, color: '#fff' },
  deleteBtn: { flex: 1, backgroundColor: colors.error + '20', borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  deleteBtnText: { ...typography.button, color: colors.error },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.xs },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.sm, ...typography.body, color: colors.text },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.label, color: colors.textSecondary },
  chipTextActive: { color: '#fff' },
  submitBtn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.md },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { ...typography.button, color: '#fff' },
});

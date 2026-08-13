import React, { useState } from 'react';
import {
  Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import {
  useAppointments, useAppointmentDetail, useCreateAppointment,
  useUpdateAppointment, useDeleteAppointment,
} from '../hooks/useAppointments';
import { EmptyState, LoadingSkeleton } from '../../../shared/components/Card';
import { colors, spacing, typography, radius } from '../../../shared/theme';
import type { ManageStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<ManageStackParamList>;

const STATUS_FILTERS = ['UPCOMING', 'COMPLETED', 'CANCELLED'];
const STATUS_COLORS: Record<string, string> = { UPCOMING: colors.primary, COMPLETED: colors.success, CANCELLED: colors.error };

export function AppointmentListScreen() {
  const navigation = useNavigation<Nav>();
  const [status, setStatus] = useState('UPCOMING');
  const { data, isLoading, refetch } = useAppointments(status);

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        {STATUS_FILTERS.map((s) => (
          <TouchableOpacity key={s} style={[styles.filterBtn, status === s && styles.filterActive]} onPress={() => setStatus(s)}>
            <Text style={[styles.filterText, status === s && styles.filterTextActive]}>{s.charAt(0) + s.slice(1).toLowerCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {isLoading ? (
        <View style={styles.skeletons}>{[1, 2, 3].map((i) => <LoadingSkeleton key={i} height={80} style={styles.skeleton} />)}</View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={false}
          ListEmptyComponent={<EmptyState title="No appointments" description="Tap + to schedule one" />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AppointmentDetail', { id: item.id })} activeOpacity={0.8}>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.doctorName}</Text>
                <Text style={styles.cardSub}>{new Date(item.date).toLocaleDateString()} at {item.time}</Text>
                {item.purpose && <Text style={styles.cardPurpose}>{item.purpose}</Text>}
              </View>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>{item.status.toLowerCase()}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateAppointment')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

export function AppointmentDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<ManageStackParamList, 'AppointmentDetail'>>();
  const { data: appt, isLoading } = useAppointmentDetail(params.id);
  const { mutate: update } = useUpdateAppointment(params.id);
  const { mutate: deleteAppt } = useDeleteAppointment();

  if (isLoading) return <View style={styles.container}><LoadingSkeleton height={200} style={styles.skeleton} /></View>;
  if (!appt) return null;

  const handleDelete = () => {
    Alert.alert('Delete appointment?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAppt(appt.id, { onSuccess: () => navigation.goBack() }) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.name}>{appt.doctorName}</Text>
        <Text style={styles.sub}>📅 {new Date(appt.date).toLocaleDateString()} at {appt.time}</Text>
        {appt.purpose && <Text style={styles.sub}>Purpose: {appt.purpose}</Text>}
        {appt.notes && <Text style={styles.notes}>{appt.notes}</Text>}
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[appt.status] + '20', alignSelf: 'flex-start', marginTop: spacing.sm }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[appt.status] }]}>{appt.status.toLowerCase()}</Text>
        </View>
      </View>
      {appt.status === 'UPCOMING' && (
        <View style={styles.statusActions}>
          <TouchableOpacity style={styles.completeBtn} onPress={() => update({ status: 'COMPLETED' })}>
            <Text style={styles.completeBtnText}>Mark Completed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => update({ status: 'CANCELLED' })}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditAppointment', { id: appt.id })}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export function CreateAppointmentScreen() {
  const navigation = useNavigation<Nav>();
  const { mutate: create, isPending } = useCreateAppointment();
  const [doctorName, setDoctorName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!doctorName.trim() || !date || !time) { Alert.alert('Required', 'Doctor name, date and time are required'); return; }
    create({ doctorName: doctorName.trim(), date, time, purpose: purpose || undefined, notes: notes || undefined },
      { onSuccess: () => navigation.goBack() });
  };

  return <AppointmentForm doctorName={doctorName} setDoctorName={setDoctorName} date={date} setDate={setDate} time={time} setTime={setTime} purpose={purpose} setPurpose={setPurpose} notes={notes} setNotes={setNotes} onSubmit={handleSubmit} isPending={isPending} submitLabel="Schedule Appointment" />;
}

export function EditAppointmentScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<ManageStackParamList, 'EditAppointment'>>();
  const { data: appt } = useAppointmentDetail(params.id);
  const { mutate: update, isPending } = useUpdateAppointment(params.id);
  const [doctorName, setDoctorName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (appt) { setDoctorName(appt.doctorName); setDate(appt.date.split('T')[0]); setTime(appt.time); setPurpose(appt.purpose ?? ''); setNotes(appt.notes ?? ''); }
  }, [appt?.id]);

  const handleSubmit = () => {
    update({ doctorName: doctorName.trim(), date, time, purpose: purpose || undefined, notes: notes || undefined },
      { onSuccess: () => navigation.goBack() });
  };

  return <AppointmentForm doctorName={doctorName} setDoctorName={setDoctorName} date={date} setDate={setDate} time={time} setTime={setTime} purpose={purpose} setPurpose={setPurpose} notes={notes} setNotes={setNotes} onSubmit={handleSubmit} isPending={isPending} submitLabel="Save Changes" />;
}

function AppointmentForm({ doctorName, setDoctorName, date, setDate, time, setTime, purpose, setPurpose, notes, setNotes, onSubmit, isPending, submitLabel }: {
  doctorName: string; setDoctorName: (v: string) => void;
  date: string; setDate: (v: string) => void;
  time: string; setTime: (v: string) => void;
  purpose: string; setPurpose: (v: string) => void;
  notes: string; setNotes: (v: string) => void;
  onSubmit: () => void; isPending: boolean; submitLabel: string;
}) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {[
        { label: 'Doctor Name *', value: doctorName, onChange: setDoctorName, placeholder: 'Dr. Name' },
        { label: 'Date * (YYYY-MM-DD)', value: date, onChange: setDate, placeholder: '2025-01-15' },
        { label: 'Time * (HH:MM)', value: time, onChange: setTime, placeholder: '10:30' },
        { label: 'Purpose', value: purpose, onChange: setPurpose, placeholder: 'e.g. Follow-up' },
      ].map((f) => (
        <View key={f.label}>
          <Text style={styles.label}>{f.label}</Text>
          <TextInput style={styles.input} value={f.value} onChangeText={f.onChange} placeholder={f.placeholder} />
        </View>
      ))}
      <Text style={styles.label}>Notes</Text>
      <TextInput style={[styles.input, styles.multiline]} value={notes} onChangeText={setNotes} multiline placeholder="Additional notes..." />
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
  filters: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm },
  filterBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { ...typography.label, color: colors.textSecondary },
  filterTextActive: { color: '#fff' },
  list: { padding: spacing.md, gap: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center' },
  cardBody: { flex: 1 },
  cardTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  cardSub: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  cardPurpose: { ...typography.label, color: colors.textDisabled, marginTop: 2 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full },
  statusText: { ...typography.label, fontWeight: '600' },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.lg, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
  headerCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  name: { ...typography.h2, color: colors.text },
  sub: { ...typography.body, color: colors.textSecondary },
  notes: { ...typography.bodySmall, color: colors.textDisabled, marginTop: spacing.xs },
  statusActions: { flexDirection: 'row', gap: spacing.sm },
  completeBtn: { flex: 1, backgroundColor: colors.success + '20', borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  completeBtnText: { ...typography.button, color: colors.success },
  cancelBtn: { flex: 1, backgroundColor: colors.warning + '20', borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  cancelBtnText: { ...typography.button, color: colors.warning },
  actions: { flexDirection: 'row', gap: spacing.sm },
  editBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  editBtnText: { ...typography.button, color: '#fff' },
  deleteBtn: { flex: 1, backgroundColor: colors.error + '20', borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  deleteBtnText: { ...typography.button, color: colors.error },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.xs },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.sm, ...typography.body, color: colors.text },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.md },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { ...typography.button, color: '#fff' },
});

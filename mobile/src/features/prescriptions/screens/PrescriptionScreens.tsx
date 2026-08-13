import React, { useState } from 'react';
import {
  Alert, FlatList, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { usePrescriptions, usePrescriptionDetail, useCreatePrescription, useDeletePrescription } from '../../prescriptions/hooks/usePrescriptions';
import { prescriptionsService } from '../../prescriptions/services/prescriptions.service';
import { EmptyState, LoadingSkeleton } from '../../../shared/components/Card';
import { DatePickerField } from '../../../shared/components/DatePickerField';
import { FilePicker, PickedFile } from '../../../shared/components/FilePicker';
import { colors, spacing, typography, radius } from '../../../shared/theme';
import type { ManageStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<ManageStackParamList>;

// ── Prescriptions ─────────────────────────────────────────────────────────────

export function PrescriptionListScreen() {
  const navigation = useNavigation<Nav>();
  const { data, isLoading, refetch } = usePrescriptions();

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.skeletons}>{[1, 2, 3].map((i) => <LoadingSkeleton key={i} height={72} style={styles.skeleton} />)}</View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={false}
          ListEmptyComponent={<EmptyState title="No prescriptions" description="Tap + to add one" />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PrescriptionDetail', { id: item.id })} activeOpacity={0.8}>
              <Text style={styles.cardIcon}>📋</Text>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.doctorName}</Text>
                <Text style={styles.cardSub}>{new Date(item.date).toLocaleDateString()}{item.clinicName ? ` · ${item.clinicName}` : ''}</Text>
                {item.medicines.length > 0 && <Text style={styles.cardMeds}>{item.medicines.map((m) => m.name).join(', ')}</Text>}
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreatePrescription')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

export function PrescriptionDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<ManageStackParamList, 'PrescriptionDetail'>>();
  const { data: p, isLoading } = usePrescriptionDetail(params.id);
  const { mutate: deletePrescription } = useDeletePrescription();

  if (isLoading) return <View style={styles.container}><LoadingSkeleton height={200} style={styles.skeleton} /></View>;
  if (!p) return null;

  const handleDownload = async () => {
    const { url } = await prescriptionsService.getDownloadUrl(p.id);
    await Linking.openURL(url);
  };

  const handleDelete = () => {
    Alert.alert('Delete prescription?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePrescription(p.id, { onSuccess: () => navigation.goBack() }) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.name}>{p.doctorName}</Text>
        {p.clinicName && <Text style={styles.sub}>{p.clinicName}</Text>}
        <Text style={styles.sub}>📅 {new Date(p.date).toLocaleDateString()}</Text>
        {p.notes && <Text style={styles.notes}>{p.notes}</Text>}
      </View>
      {p.medicines.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medicines</Text>
          {p.medicines.map((m) => (
            <Text key={m.id} style={styles.medItem}>• {m.name} — {m.dosage}</Text>
          ))}
        </View>
      )}
      <View style={styles.actions}>
        {p.fileName && (
          <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
            <Text style={styles.downloadBtnText}>📄 View File</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export function CreatePrescriptionScreen() {
  const navigation = useNavigation<Nav>();
  const { mutate: create, isPending } = useCreatePrescription();
  const [doctorName, setDoctorName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<PickedFile | null>(null);

  const handleSubmit = () => {
    if (!doctorName.trim() || !date) { Alert.alert('Required', 'Doctor name and date are required'); return; }
    create({ doctorName: doctorName.trim(), clinicName: clinicName || undefined, date, notes: notes || undefined, file: file ?? undefined },
      { onSuccess: () => navigation.goBack() });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Doctor Name *</Text>
      <TextInput style={styles.input} value={doctorName} onChangeText={setDoctorName} placeholder="Dr. Name" />
      <Text style={styles.label}>Clinic / Hospital</Text>
      <TextInput style={styles.input} value={clinicName} onChangeText={setClinicName} placeholder="Clinic name" />
      <DatePickerField label="Date *" value={date} onChange={setDate} />
      <Text style={styles.label}>Notes</Text>
      <TextInput style={[styles.input, styles.multiline]} value={notes} onChangeText={setNotes} multiline placeholder="Notes..." />
      <FilePicker label="Prescription File (optional)" file={file} onChange={setFile} />
      <TouchableOpacity style={[styles.submitBtn, isPending && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={isPending}>
        <Text style={styles.submitBtnText}>{isPending ? 'Saving...' : 'Add Prescription'}</Text>
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
  cardMeds: { ...typography.label, color: colors.textDisabled, marginTop: 2 },
  chevron: { fontSize: 20, color: colors.textDisabled },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.lg, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
  headerCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  name: { ...typography.h2, color: colors.text },
  sub: { ...typography.body, color: colors.textSecondary },
  notes: { ...typography.bodySmall, color: colors.textDisabled, marginTop: spacing.xs },
  section: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  medItem: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm },
  downloadBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  downloadBtnText: { ...typography.button, color: '#fff' },
  deleteBtn: { flex: 1, backgroundColor: colors.error + '20', borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  deleteBtnText: { ...typography.button, color: colors.error },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.xs },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.sm, ...typography.body, color: colors.text },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.md },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { ...typography.button, color: '#fff' },
});

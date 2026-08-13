import React, { useState } from 'react';
import {
  Alert, FlatList, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useMedicalReports, useCreateMedicalReport, useDeleteMedicalReport } from '../hooks/useMedicalReports';
import { medicalReportsService } from '../services/medical-reports.service';
import { EmptyState, LoadingSkeleton } from '../../../shared/components/Card';
import { DatePickerField } from '../../../shared/components/DatePickerField';
import { FilePicker, PickedFile } from '../../../shared/components/FilePicker';
import { colors, spacing, typography, radius } from '../../../shared/theme';
import type { ManageStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<ManageStackParamList>;

const REPORT_TYPES = ['BLOOD_TEST', 'XRAY', 'CT_SCAN', 'MRI', 'ULTRASOUND', 'ECG', 'VACCINATION', 'LAB_REPORT', 'OTHER'];
const TYPE_ICONS: Record<string, string> = {
  BLOOD_TEST: '🩸', XRAY: '🦴', CT_SCAN: '🧠', MRI: '🧲',
  ULTRASOUND: '📡', ECG: '❤️', VACCINATION: '💉', LAB_REPORT: '🔬', OTHER: '📄',
};

export function MedicalReportListScreen() {
  const navigation = useNavigation<Nav>();
  const [type, setType] = useState<string | undefined>(undefined);
  const { data, isLoading, refetch } = useMedicalReports(type);

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <TouchableOpacity style={[styles.filterBtn, !type && styles.filterActive]} onPress={() => setType(undefined)}>
          <Text style={[styles.filterText, !type && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        {REPORT_TYPES.slice(0, 4).map((t) => (
          <TouchableOpacity key={t} style={[styles.filterBtn, type === t && styles.filterActive]} onPress={() => setType(t)}>
            <Text style={[styles.filterText, type === t && styles.filterTextActive]}>{t.replace('_', ' ')}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {isLoading ? (
        <View style={styles.skeletons}>{[1, 2, 3].map((i) => <LoadingSkeleton key={i} height={72} style={styles.skeleton} />)}</View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={false}
          ListEmptyComponent={<EmptyState title="No reports" description="Tap + to upload a report" />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MedicalReportDetail', { id: item.id })} activeOpacity={0.8}>
              <Text style={styles.cardIcon}>{TYPE_ICONS[item.type] ?? '📄'}</Text>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSub}>{new Date(item.date).toLocaleDateString()}{item.doctorLab ? ` · ${item.doctorLab}` : ''}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateMedicalReport')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

export function MedicalReportDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<ManageStackParamList, 'MedicalReportDetail'>>();
  const { mutate: deleteReport } = useDeleteMedicalReport();

  const handleDownload = async () => {
    const { url } = await medicalReportsService.getDownloadUrl(params.id);
    await Linking.openURL(url);
  };

  const handleDelete = () => {
    Alert.alert('Delete report?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteReport(params.id, { onSuccess: () => navigation.goBack() }) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
          <Text style={styles.downloadBtnText}>📄 View File</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export function CreateMedicalReportScreen() {
  const navigation = useNavigation<Nav>();
  const { mutate: create, isPending } = useCreateMedicalReport();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('BLOOD_TEST');
  const [date, setDate] = useState('');
  const [doctorLab, setDoctorLab] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<PickedFile | null>(null);

  const handleSubmit = () => {
    if (!title.trim() || !date) { Alert.alert('Required', 'Title, type and date are required'); return; }
    if (!file) { Alert.alert('Required', 'Please select a file to upload'); return; }
    create({ title: title.trim(), type, date, doctorLab: doctorLab || undefined, notes: notes || undefined, file },
      { onSuccess: () => navigation.goBack() });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Title *</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. CBC Report" />

      <Text style={styles.label}>Type</Text>
      <View style={styles.chipRow}>
        {REPORT_TYPES.map((t) => (
          <TouchableOpacity key={t} style={[styles.chip, type === t && styles.chipActive]} onPress={() => setType(t)}>
            <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{TYPE_ICONS[t]} {t.replace('_', ' ')}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <DatePickerField label="Date *" value={date} onChange={setDate} />

      <Text style={styles.label}>Doctor / Lab</Text>
      <TextInput style={styles.input} value={doctorLab} onChangeText={setDoctorLab} placeholder="Lab or doctor name" />

      <Text style={styles.label}>Notes</Text>
      <TextInput style={[styles.input, styles.multiline]} value={notes} onChangeText={setNotes} multiline placeholder="Notes..." />

      <FilePicker label="Report File *" file={file} onChange={setFile} />

      <TouchableOpacity style={[styles.submitBtn, isPending && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={isPending}>
        <Text style={styles.submitBtnText}>{isPending ? 'Uploading...' : 'Add Report'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl },
  skeletons: { padding: spacing.md, gap: spacing.sm },
  skeleton: { borderRadius: radius.md, marginBottom: spacing.sm },
  filters: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.md, gap: spacing.xs },
  filterBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { ...typography.label, color: colors.textSecondary },
  filterTextActive: { color: '#fff' },
  list: { padding: spacing.md, gap: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardIcon: { fontSize: 28 },
  cardBody: { flex: 1 },
  cardTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  cardSub: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 20, color: colors.textDisabled },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.lg, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  downloadBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  downloadBtnText: { ...typography.button, color: '#fff' },
  deleteBtn: { flex: 1, backgroundColor: colors.error + '20', borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  deleteBtnText: { ...typography.button, color: colors.error },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.xs },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.sm, ...typography.body, color: colors.text },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.label, color: colors.textSecondary },
  chipTextActive: { color: '#fff' },
  submitBtn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.md },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { ...typography.button, color: '#fff' },
});

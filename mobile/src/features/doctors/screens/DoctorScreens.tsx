import React, { useState } from 'react';
import {
  Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useDoctors, useDoctorDetail, useCreateDoctor, useUpdateDoctor, useDeleteDoctor } from '../hooks/useDoctors';
import { EmptyState, LoadingSkeleton } from '../../../shared/components/Card';
import { colors, spacing, typography, radius } from '../../../shared/theme';
import type { ManageStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<ManageStackParamList>;

export function DoctorListScreen() {
  const navigation = useNavigation<Nav>();
  const { data, isLoading, refetch } = useDoctors();

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.skeletons}>
          {[1, 2, 3].map((i) => <LoadingSkeleton key={i} height={72} style={styles.skeleton} />)}
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={false}
          ListEmptyComponent={<EmptyState title="No doctors" description="Tap + to add a doctor" />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('DoctorDetail', { id: item.id })} activeOpacity={0.8}>
              <Text style={styles.cardIcon}>👨⚕️</Text>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSub}>{[item.specialization, item.hospital].filter(Boolean).join(' · ')}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateDoctor')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

export function DoctorDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<ManageStackParamList, 'DoctorDetail'>>();
  const { data: doctor, isLoading } = useDoctorDetail(params.id);
  const { mutate: deleteDoctor } = useDeleteDoctor();

  if (isLoading) return <View style={styles.container}><LoadingSkeleton height={200} style={styles.skeleton} /></View>;
  if (!doctor) return null;

  const handleDelete = () => {
    Alert.alert('Delete doctor?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteDoctor(doctor.id, { onSuccess: () => navigation.goBack() }) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.name}>{doctor.name}</Text>
        {doctor.specialization && <Text style={styles.sub}>{doctor.specialization}</Text>}
        {doctor.hospital && <Text style={styles.sub}>{doctor.hospital}</Text>}
        {doctor.phone && <Text style={styles.sub}>📞 {doctor.phone}</Text>}
        {doctor.address && <Text style={styles.sub}>📍 {doctor.address}</Text>}
        {doctor.notes && <Text style={styles.notes}>{doctor.notes}</Text>}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditDoctor', { id: doctor.id })}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export function CreateDoctorScreen() {
  const navigation = useNavigation<Nav>();
  const { mutate: create, isPending } = useCreateDoctor();
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [hospital, setHospital] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) { Alert.alert('Required', 'Name is required'); return; }
    create({ name: name.trim(), specialization: specialization || undefined, hospital: hospital || undefined, phone: phone || undefined, notes: notes || undefined },
      { onSuccess: () => navigation.goBack() });
  };

  return <DoctorForm name={name} setName={setName} specialization={specialization} setSpecialization={setSpecialization} hospital={hospital} setHospital={setHospital} phone={phone} setPhone={setPhone} notes={notes} setNotes={setNotes} onSubmit={handleSubmit} isPending={isPending} submitLabel="Add Doctor" />;
}

export function EditDoctorScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<ManageStackParamList, 'EditDoctor'>>();
  const { data: doctor } = useDoctorDetail(params.id);
  const { mutate: update, isPending } = useUpdateDoctor(params.id);
  const [name, setName] = useState(doctor?.name ?? '');
  const [specialization, setSpecialization] = useState(doctor?.specialization ?? '');
  const [hospital, setHospital] = useState(doctor?.hospital ?? '');
  const [phone, setPhone] = useState(doctor?.phone ?? '');
  const [notes, setNotes] = useState(doctor?.notes ?? '');

  React.useEffect(() => {
    if (doctor) { setName(doctor.name); setSpecialization(doctor.specialization ?? ''); setHospital(doctor.hospital ?? ''); setPhone(doctor.phone ?? ''); setNotes(doctor.notes ?? ''); }
  }, [doctor?.id]);

  const handleSubmit = () => {
    update({ name: name.trim(), specialization: specialization || undefined, hospital: hospital || undefined, phone: phone || undefined, notes: notes || undefined },
      { onSuccess: () => navigation.goBack() });
  };

  return <DoctorForm name={name} setName={setName} specialization={specialization} setSpecialization={setSpecialization} hospital={hospital} setHospital={setHospital} phone={phone} setPhone={setPhone} notes={notes} setNotes={setNotes} onSubmit={handleSubmit} isPending={isPending} submitLabel="Save Changes" />;
}

function DoctorForm({ name, setName, specialization, setSpecialization, hospital, setHospital, phone, setPhone, notes, setNotes, onSubmit, isPending, submitLabel }: {
  name: string; setName: (v: string) => void;
  specialization: string; setSpecialization: (v: string) => void;
  hospital: string; setHospital: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  notes: string; setNotes: (v: string) => void;
  onSubmit: () => void; isPending: boolean; submitLabel: string;
}) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {[
        { label: 'Name *', value: name, onChange: setName, placeholder: 'Dr. Name' },
        { label: 'Specialization', value: specialization, onChange: setSpecialization, placeholder: 'e.g. Cardiologist' },
        { label: 'Hospital / Clinic', value: hospital, onChange: setHospital, placeholder: 'Hospital name' },
        { label: 'Phone', value: phone, onChange: setPhone, placeholder: '+91 ...' },
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
  skeleton: { borderRadius: radius.md, marginBottom: spacing.sm },
  list: { padding: spacing.md, gap: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardIcon: { fontSize: 28 },
  cardBody: { flex: 1 },
  cardTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  cardSub: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 20, color: colors.textDisabled },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.lg, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
  headerCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  name: { ...typography.h2, color: colors.text },
  sub: { ...typography.body, color: colors.textSecondary },
  notes: { ...typography.bodySmall, color: colors.textDisabled, marginTop: spacing.xs },
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

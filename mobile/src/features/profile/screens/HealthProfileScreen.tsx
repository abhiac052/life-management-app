import React, { useEffect, useState } from 'react';
import {
  Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useHealthProfile, useUpsertHealthProfile } from '../hooks/useHealthProfile';
import { LoadingSkeleton } from '../../../shared/components/Card';
import { colors, spacing, typography, radius } from '../../../shared/theme';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function HealthProfileScreen() {
  const { data: hp, isLoading } = useHealthProfile();
  const { mutate: upsert, isPending } = useUpsertHealthProfile();

  const [bloodGroup, setBloodGroup] = useState('');
  const [allergiesText, setAllergiesText] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');

  useEffect(() => {
    if (hp) {
      setBloodGroup(hp.bloodGroup ?? '');
      setAllergiesText(hp.allergies.join(', '));
      setHeightCm(hp.heightCm != null ? String(hp.heightCm) : '');
      setWeightKg(hp.weightKg != null ? String(hp.weightKg) : '');
      setEmergencyName(hp.emergencyName ?? '');
      setEmergencyPhone(hp.emergencyPhone ?? '');
      setMedicalNotes(hp.medicalNotes ?? '');
    }
  }, [hp?.id]);

  const handleSave = () => {
    const allergies = allergiesText
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    upsert(
      {
        bloodGroup: bloodGroup || undefined,
        allergies,
        heightCm: heightCm ? parseFloat(heightCm) : undefined,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        emergencyName: emergencyName || undefined,
        emergencyPhone: emergencyPhone || undefined,
        medicalNotes: medicalNotes || undefined,
      },
      { onSuccess: () => Alert.alert('Saved', 'Health profile updated') },
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        {[1, 2, 3].map((i) => <LoadingSkeleton key={i} height={80} style={styles.skeleton} />)}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

      {/* Blood Group */}
      <Text style={styles.sectionTitle}>Blood Group</Text>
      <View style={styles.chipRow}>
        {BLOOD_GROUPS.map((bg) => (
          <TouchableOpacity
            key={bg}
            style={[styles.chip, bloodGroup === bg && styles.chipActive]}
            onPress={() => setBloodGroup(bloodGroup === bg ? '' : bg)}
          >
            <Text style={[styles.chipText, bloodGroup === bg && styles.chipTextActive]}>{bg}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Body Metrics */}
      <Text style={styles.sectionTitle}>Body Metrics</Text>
      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput style={styles.input} value={heightCm} onChangeText={setHeightCm} keyboardType="decimal-pad" placeholder="170" />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput style={styles.input} value={weightKg} onChangeText={setWeightKg} keyboardType="decimal-pad" placeholder="70" />
        </View>
      </View>

      {/* Allergies */}
      <Text style={styles.sectionTitle}>Allergies</Text>
      <TextInput
        style={styles.input}
        value={allergiesText}
        onChangeText={setAllergiesText}
        placeholder="Penicillin, Peanuts, Dust (comma separated)"
      />

      {/* Emergency Contact */}
      <Text style={styles.sectionTitle}>Emergency Contact</Text>
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={emergencyName} onChangeText={setEmergencyName} placeholder="Contact name" />
      <Text style={styles.label}>Phone</Text>
      <TextInput style={styles.input} value={emergencyPhone} onChangeText={setEmergencyPhone} placeholder="+91 ..." keyboardType="phone-pad" />

      {/* Medical Notes */}
      <Text style={styles.sectionTitle}>Medical Notes</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={medicalNotes}
        onChangeText={setMedicalNotes}
        multiline
        placeholder="Important medical information, chronic conditions..."
      />

      <TouchableOpacity
        style={[styles.saveBtn, isPending && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={isPending}
      >
        <Text style={styles.saveBtnText}>{isPending ? 'Saving...' : 'Save Health Profile'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl },
  skeleton: { borderRadius: radius.md, marginBottom: spacing.sm, margin: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radius.full, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.error, borderColor: colors.error },
  chipText: { ...typography.body, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  row: { flexDirection: 'row', gap: spacing.sm },
  halfField: { flex: 1 },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.sm, padding: spacing.sm, ...typography.body, color: colors.text,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.md },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { ...typography.button, color: '#fff' },
});

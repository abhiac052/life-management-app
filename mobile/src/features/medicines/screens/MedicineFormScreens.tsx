import React, { useEffect, useState } from 'react';
import {
  Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useCreateMedicine, useUpdateMedicine, useMedicineDetail } from '../hooks/useMedicines';
import { colors, spacing, typography, radius } from '../../../shared/theme';
import type { MedicinesStackParamList } from '../../../app/navigation/types';
import type { CreateMedicinePayload } from '../services/medicines.service';
import { DatePickerField } from '../../../shared/components/DatePickerField';

type Nav = NativeStackNavigationProp<MedicinesStackParamList>;

const FORMS = ['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'DROPS', 'INHALER', 'CREAM', 'OTHER'];
const MEAL_RELATIONS = ['BEFORE_FOOD', 'AFTER_FOOD', 'WITH_FOOD', 'NO_PREFERENCE'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface ScheduleEntry { time: string; label: string; daysOfWeek: number[] }

function useForm(initial?: Partial<CreateMedicinePayload>) {
  const [name, setName] = useState(initial?.name ?? '');
  const [dosage, setDosage] = useState(initial?.dosage ?? '');
  const [form, setForm] = useState(initial?.form ?? 'TABLET');
  const [mealRelation, setMealRelation] = useState(initial?.mealRelation ?? 'NO_PREFERENCE');
  const [instructions, setInstructions] = useState(initial?.instructions ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [startDate, setStartDate] = useState(initial?.startDate ?? new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(initial?.endDate ?? '');
  const [schedules, setSchedules] = useState<ScheduleEntry[]>(
    initial?.schedules?.map((s) => ({ time: s.time, label: s.label ?? '', daysOfWeek: s.daysOfWeek })) ?? [],
  );
  const [stockQty, setStockQty] = useState(initial?.stockQty !== undefined ? String(initial.stockQty) : '');

  return {
    name, setName, dosage, setDosage, form, setForm,
    mealRelation, setMealRelation, instructions, setInstructions,
    notes, setNotes, startDate, setStartDate, endDate, setEndDate,
    schedules, setSchedules, stockQty, setStockQty,
  };
}

export function CreateMedicineScreen() {
  const navigation = useNavigation<Nav>();
  const { mutate: create, isPending } = useCreateMedicine();
  const f = useForm();

  const handleSubmit = () => {
    if (!f.name.trim() || !f.dosage.trim()) {
      Alert.alert('Required', 'Name and dosage are required');
      return;
    }
    const payload: CreateMedicinePayload = {
      name: f.name.trim(),
      dosage: f.dosage.trim(),
      form: f.form,
      mealRelation: f.mealRelation,
      instructions: f.instructions || undefined,
      notes: f.notes || undefined,
      startDate: f.startDate,
      endDate: f.endDate || undefined,
      schedules: f.schedules.map((s) => ({ time: s.time, label: s.label || undefined, daysOfWeek: s.daysOfWeek })),
      stockQty: f.stockQty ? parseInt(f.stockQty, 10) : undefined,
    };
    create(payload, { onSuccess: () => navigation.goBack() });
  };

  return <MedicineForm f={f} onSubmit={handleSubmit} isPending={isPending} title="Add Medicine" />;
}

export function EditMedicineScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<MedicinesStackParamList, 'EditMedicine'>>();
  const { data: medicine } = useMedicineDetail(params.id);
  const { mutate: update, isPending } = useUpdateMedicine(params.id);
  const f = useForm();

  useEffect(() => {
    if (medicine) {
      f.setName(medicine.name);
      f.setDosage(medicine.dosage);
      f.setForm(medicine.form);
      f.setMealRelation(medicine.mealRelation);
      f.setInstructions(medicine.instructions ?? '');
      f.setNotes(medicine.notes ?? '');
      f.setStartDate(medicine.startDate.split('T')[0]);
      f.setEndDate(medicine.endDate?.split('T')[0] ?? '');
      f.setSchedules(medicine.schedules.map((s) => ({ time: s.time, label: s.label ?? '', daysOfWeek: s.daysOfWeek })));
      f.setStockQty(medicine.stock ? String(medicine.stock.currentQty) : '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicine?.id]);

  const handleSubmit = () => {
    if (!f.name.trim() || !f.dosage.trim()) {
      Alert.alert('Required', 'Name and dosage are required');
      return;
    }
    update(
      {
        name: f.name.trim(),
        dosage: f.dosage.trim(),
        form: f.form,
        mealRelation: f.mealRelation,
        instructions: f.instructions || undefined,
        notes: f.notes || undefined,
        startDate: f.startDate,
        endDate: f.endDate || undefined,
      },
      { onSuccess: () => navigation.goBack() },
    );
  };

  return <MedicineForm f={f} onSubmit={handleSubmit} isPending={isPending} title="Edit Medicine" />;
}

function MedicineForm({
  f, onSubmit, isPending, title,
}: {
  f: ReturnType<typeof useForm>;
  onSubmit: () => void;
  isPending: boolean;
  title: string;
}) {
  const addSchedule = () => {
    f.setSchedules([...f.schedules, { time: '08:00', label: '', daysOfWeek: [] }]);
  };

  const removeSchedule = (i: number) => {
    f.setSchedules(f.schedules.filter((_, idx) => idx !== i));
  };

  const toggleDay = (schedIdx: number, day: number) => {
    f.setSchedules(
      f.schedules.map((s, i) =>
        i === schedIdx
          ? { ...s, daysOfWeek: s.daysOfWeek.includes(day) ? s.daysOfWeek.filter((d) => d !== day) : [...s.daysOfWeek, day] }
          : s,
      ),
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionTitle}>Basic Info</Text>

      <Text style={styles.label}>Name *</Text>
      <TextInput style={styles.input} value={f.name} onChangeText={f.setName} placeholder="e.g. Metformin" />

      <Text style={styles.label}>Dosage *</Text>
      <TextInput style={styles.input} value={f.dosage} onChangeText={f.setDosage} placeholder="e.g. 500mg" />

      <Text style={styles.label}>Form</Text>
      <View style={styles.chipRow}>
        {FORMS.map((fm) => (
          <TouchableOpacity
            key={fm}
            style={[styles.chip, f.form === fm && styles.chipActive]}
            onPress={() => f.setForm(fm)}
          >
            <Text style={[styles.chipText, f.form === fm && styles.chipTextActive]}>
              {fm.charAt(0) + fm.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Meal Relation</Text>
      <View style={styles.chipRow}>
        {MEAL_RELATIONS.map((mr) => (
          <TouchableOpacity
            key={mr}
            style={[styles.chip, f.mealRelation === mr && styles.chipActive]}
            onPress={() => f.setMealRelation(mr)}
          >
            <Text style={[styles.chipText, f.mealRelation === mr && styles.chipTextActive]}>
              {mr.replace(/_/g, ' ').toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <DatePickerField label="Start Date" value={f.startDate} onChange={f.setStartDate} />
      <DatePickerField label="End Date (optional)" value={f.endDate} onChange={f.setEndDate} />

      <Text style={styles.label}>Instructions</Text>
      <TextInput style={[styles.input, styles.multiline]} value={f.instructions} onChangeText={f.setInstructions} multiline placeholder="Special instructions..." />

      <Text style={styles.label}>Notes</Text>
      <TextInput style={[styles.input, styles.multiline]} value={f.notes} onChangeText={f.setNotes} multiline placeholder="Additional notes..." />

      {/* Schedules */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Schedules</Text>
        <TouchableOpacity onPress={addSchedule}>
          <Text style={styles.addLink}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {f.schedules.map((s, i) => (
        <View key={i} style={styles.scheduleCard}>
          <View style={styles.scheduleRow}>
            <TextInput
              style={[styles.input, styles.timeInput]}
              value={s.time}
              onChangeText={(v) => f.setSchedules(f.schedules.map((sc, idx) => idx === i ? { ...sc, time: v } : sc))}
              placeholder="HH:MM"
            />
            <TextInput
              style={[styles.input, styles.labelInput]}
              value={s.label}
              onChangeText={(v) => f.setSchedules(f.schedules.map((sc, idx) => idx === i ? { ...sc, label: v } : sc))}
              placeholder="Label (Morning...)"
            />
            <TouchableOpacity onPress={() => removeSchedule(i)}>
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dayRow}>
            {DAYS.map((day, d) => (
              <TouchableOpacity
                key={day}
                style={[styles.dayChip, s.daysOfWeek.includes(d + 1) && styles.dayChipActive]}
                onPress={() => toggleDay(i, d + 1)}
              >
                <Text style={[styles.dayText, s.daysOfWeek.includes(d + 1) && styles.dayTextActive]}>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.dayHint}>{s.daysOfWeek.length === 0 ? 'Every day' : `${s.daysOfWeek.length} days selected`}</Text>
        </View>
      ))}

      {/* Stock */}
      <Text style={styles.sectionTitle}>Stock (optional)</Text>
      <Text style={styles.label}>Current quantity</Text>
      <TextInput
        style={styles.input}
        value={f.stockQty}
        onChangeText={f.setStockQty}
        keyboardType="number-pad"
        placeholder="e.g. 30"
      />

      <TouchableOpacity
        style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}
        onPress={onSubmit}
        disabled={isPending}
      >
        <Text style={styles.submitBtnText}>{isPending ? 'Saving...' : title}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl },
  sectionTitle: { ...typography.h3, color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  addLink: { ...typography.body, color: colors.primary },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.sm, padding: spacing.sm, ...typography.body, color: colors.text,
  },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: radius.full, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.label, color: colors.textSecondary },
  chipTextActive: { color: '#fff' },
  scheduleCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.sm, gap: spacing.xs },
  scheduleRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  timeInput: { width: 80 },
  labelInput: { flex: 1 },
  removeText: { color: colors.error, fontSize: 16, padding: spacing.xs },
  dayRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  dayChip: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.divider, alignItems: 'center', justifyContent: 'center',
  },
  dayChipActive: { backgroundColor: colors.primary },
  dayText: { ...typography.label, color: colors.textSecondary },
  dayTextActive: { color: '#fff' },
  dayHint: { ...typography.label, color: colors.textDisabled },
  submitBtn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.md },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { ...typography.button, color: '#fff' },
});

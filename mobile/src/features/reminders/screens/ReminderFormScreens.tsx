import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useCreateReminder, useUpdateReminder, useReminderDetail } from '../hooks/useReminders';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { colors, spacing, typography } from '../../../shared/theme';
import type { RemindersStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RemindersStackParamList>;

const RECURRENCE_OPTIONS = ['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  recurrenceType: z.string(),
});
type FormData = { title: string; description?: string; category?: string; dueDate: string; recurrenceType: string };

// ── Create ────────────────────────────────────────────────────────────────────

export function CreateReminderScreen() {
  const navigation = useNavigation<Nav>();
  const { mutateAsync, isPending } = useCreateReminder();

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { recurrenceType: 'ONCE' },
  });

  const recurrenceType = watch('recurrenceType');

  const onSubmit = async (data: FormData) => {
    try {
      const now = new Date().toISOString();
      await mutateAsync({
        title: data.title,
        description: data.description,
        category: data.category,
        startDate: now,
        dueDate: new Date(data.dueDate).toISOString(),
        recurrenceType: data.recurrenceType,
        notifyBefore: [60, 0],
      });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to create reminder');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Controller control={control} name="title" render={({ field: { onChange, value } }) => (
        <Input label="Title" value={value} onChangeText={onChange} error={errors.title?.message} />
      )} />
      <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
        <Input label="Description (optional)" value={value} onChangeText={onChange} multiline />
      )} />
      <Controller control={control} name="category" render={({ field: { onChange, value } }) => (
        <Input label="Category (optional)" value={value} onChangeText={onChange} />
      )} />
      <Controller control={control} name="dueDate" render={({ field: { onChange, value } }) => (
        <Input label="Due Date (YYYY-MM-DDTHH:MM)" value={value} onChangeText={onChange} error={errors.dueDate?.message} placeholder="2026-12-31T09:00" />
      )} />

      <Text style={styles.sectionLabel}>Recurrence</Text>
      <View style={styles.recurrenceRow}>
        {RECURRENCE_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.recurrenceBtn, recurrenceType === opt && styles.recurrenceActive]}
            onPress={() => setValue('recurrenceType', opt)}
          >
            <Text style={[styles.recurrenceText, recurrenceType === opt && styles.recurrenceTextActive]}>
              {opt.charAt(0) + opt.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title="Create Reminder" loading={isPending} onPress={() => { void handleSubmit(onSubmit)(); }} />
    </ScrollView>
  );
}

// ── Edit ──────────────────────────────────────────────────────────────────────

export function EditReminderScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<RemindersStackParamList, 'EditReminder'>>();
  const { data: reminder } = useReminderDetail(params.id);
  const { mutateAsync, isPending } = useUpdateReminder();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: reminder?.title ?? '',
      description: reminder?.description ?? '',
      category: reminder?.category ?? '',
      dueDate: reminder?.dueDate ? new Date(reminder.dueDate).toISOString().slice(0, 16) : '',
      recurrenceType: reminder?.recurrenceType ?? 'ONCE',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await mutateAsync({ id: params.id, data: { ...data, dueDate: new Date(data.dueDate).toISOString() } });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to update reminder');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Controller control={control} name="title" render={({ field: { onChange, value } }) => (
        <Input label="Title" value={value} onChangeText={onChange} error={errors.title?.message} />
      )} />
      <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
        <Input label="Description" value={value} onChangeText={onChange} multiline />
      )} />
      <Controller control={control} name="dueDate" render={({ field: { onChange, value } }) => (
        <Input label="Due Date" value={value} onChangeText={onChange} error={errors.dueDate?.message} />
      )} />
      <Button title="Save Changes" loading={isPending} onPress={() => { void handleSubmit(onSubmit)(); }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  sectionLabel: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
  recurrenceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  recurrenceBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  recurrenceActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  recurrenceText: { ...typography.label, color: colors.textSecondary },
  recurrenceTextActive: { color: '#fff' },
});

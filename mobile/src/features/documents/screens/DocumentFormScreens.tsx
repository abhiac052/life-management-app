import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useUploadDocument, useUpdateDocument, useDocumentDetail } from '../hooks/useDocuments';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { colors, spacing, typography } from '../../../shared/theme';
import type { VaultStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<VaultStackParamList>;

const CATEGORIES = ['AADHAAR', 'PAN', 'PASSPORT', 'DRIVING_LICENCE', 'INSURANCE', 'PROPERTY', 'EDUCATION', 'MEDICAL', 'VEHICLE', 'OTHER'];

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
});
type CreateFormData = { name: string; category: string; description?: string; issueDate?: string; expiryDate?: string; notes?: string };

// ── Create ────────────────────────────────────────────────────────────────────

export function CreateDocumentScreen() {
  const navigation = useNavigation<Nav>();
  const { mutateAsync, isPending } = useUploadDocument();

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: { category: 'OTHER' },
  });

  const category = watch('category');

  const onSubmit = async (data: CreateFormData) => {
    // In a real app, use a file picker here. For now we show a placeholder.
    Alert.alert('File Picker', 'In the real app, a file picker would open here. For testing, this form captures metadata only.');
    // Example with a mock file — replace with actual file picker result
    try {
      await mutateAsync({
        file: { uri: 'file://mock', name: 'document.pdf', type: 'application/pdf' },
        name: data.name,
        category: data.category,
        description: data.description,
        issueDate: data.issueDate,
        expiryDate: data.expiryDate,
        notes: data.notes,
        setExpiryReminder: !!data.expiryDate,
        reminderDaysBefore: 30,
      });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Upload failed');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
        <Input label="Document Name" value={value} onChangeText={onChange} error={errors.name?.message} />
      )} />

      <Text style={styles.sectionLabel}>Category</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.catBtn, category === cat && styles.catActive]}
            onPress={() => setValue('category', cat)}
          >
            <Text style={[styles.catText, category === cat && styles.catTextActive]}>
              {cat.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
        <Input label="Description (optional)" value={value} onChangeText={onChange} multiline />
      )} />
      <Controller control={control} name="issueDate" render={({ field: { onChange, value } }) => (
        <Input label="Issue Date (YYYY-MM-DD)" value={value} onChangeText={onChange} placeholder="2020-01-15" />
      )} />
      <Controller control={control} name="expiryDate" render={({ field: { onChange, value } }) => (
        <Input label="Expiry Date (YYYY-MM-DD)" value={value} onChangeText={onChange} placeholder="2030-01-15" />
      )} />
      <Controller control={control} name="notes" render={({ field: { onChange, value } }) => (
        <Input label="Notes (optional)" value={value} onChangeText={onChange} multiline />
      )} />

      <Button title="Upload Document" loading={isPending} onPress={() => { void handleSubmit(onSubmit)(); }} />
    </ScrollView>
  );
}

// ── Edit ──────────────────────────────────────────────────────────────────────

const editSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  notes: z.string().optional(),
});
type EditFormData = { name: string; description?: string; notes?: string };

export function EditDocumentScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<VaultStackParamList, 'EditDocument'>>();
  const { data: doc } = useDocumentDetail(params.id);
  const { mutateAsync, isPending } = useUpdateDocument();

  const { control, handleSubmit, formState: { errors } } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: doc?.name ?? '', description: doc?.description ?? '', notes: doc?.notes ?? '' },
  });

  const onSubmit = async (data: EditFormData) => {
    try {
      await mutateAsync({ id: params.id, data });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to update document');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
        <Input label="Name" value={value} onChangeText={onChange} error={errors.name?.message} />
      )} />
      <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
        <Input label="Description" value={value} onChangeText={onChange} multiline />
      )} />
      <Controller control={control} name="notes" render={({ field: { onChange, value } }) => (
        <Input label="Notes" value={value} onChangeText={onChange} multiline />
      )} />
      <Button title="Save Changes" loading={isPending} onPress={() => { void handleSubmit(onSubmit)(); }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  sectionLabel: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  catBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  catActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catText: { ...typography.label, color: colors.textSecondary },
  catTextActive: { color: '#fff' },
});

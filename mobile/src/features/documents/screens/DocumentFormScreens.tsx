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
import { DatePickerField } from '../../../shared/components/DatePickerField';
import { FilePicker, PickedFile } from '../../../shared/components/FilePicker';
import { Icon } from '../../../shared/components/Icon';
import { colors, spacing, typography, radius } from '../../../shared/theme';
import type { VaultStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<VaultStackParamList>;

const CATEGORIES = [
  { key: 'AADHAAR',         label: 'Aadhaar',   icon: 'card-account-details-outline' },
  { key: 'PAN',             label: 'PAN',        icon: 'credit-card-outline' },
  { key: 'PASSPORT',        label: 'Passport',  icon: 'passport' },
  { key: 'DRIVING_LICENCE', label: 'Licence',   icon: 'car-key' },
  { key: 'INSURANCE',       label: 'Insurance', icon: 'shield-check-outline' },
  { key: 'PROPERTY',        label: 'Property',  icon: 'home-outline' },
  { key: 'EDUCATION',       label: 'Education', icon: 'school-outline' },
  { key: 'MEDICAL',         label: 'Medical',   icon: 'heart-pulse' },
  { key: 'VEHICLE',         label: 'Vehicle',   icon: 'car-outline' },
  { key: 'OTHER',           label: 'Other',     icon: 'file-outline' },
];

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1),
  description: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
});
type CreateFormData = z.infer<typeof createSchema>;

export function CreateDocumentScreen() {
  const navigation = useNavigation<Nav>();
  const { mutateAsync, isPending } = useUploadDocument();
  const [file, setFile] = React.useState<PickedFile | null>(null);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: { category: 'OTHER' },
  });
  const category = watch('category');

  const onSubmit = async (data: CreateFormData) => {
    if (!file) { Alert.alert('Required', 'Please select a file to upload'); return; }
    try {
      await mutateAsync({
        file,
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
        <Input label="Document Name" value={value} onChangeText={onChange} error={errors.name?.message} />
      )} />

      <Text style={styles.sectionLabel}>Category</Text>
      <View style={styles.catGrid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.catBtn, category === cat.key && styles.catBtnActive]}
            onPress={() => setValue('category', cat.key)}
            activeOpacity={0.75}
          >
            <Icon name={cat.icon} size={14} color={category === cat.key ? colors.white : colors.textSecondary} />
            <Text style={[styles.catBtnText, category === cat.key && styles.catBtnTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
        <Input label="Description (optional)" value={value} onChangeText={onChange} multiline />
      )} />

      <Controller control={control} name="issueDate" render={({ field: { onChange, value } }) => (
        <DatePickerField label="Issue Date (optional)" value={value ?? ''} onChange={onChange} />
      )} />

      <Controller control={control} name="expiryDate" render={({ field: { onChange, value } }) => (
        <DatePickerField label="Expiry Date (optional)" value={value ?? ''} onChange={onChange} />
      )} />

      <Controller control={control} name="notes" render={({ field: { onChange, value } }) => (
        <Input label="Notes (optional)" value={value} onChangeText={onChange} multiline />
      )} />

      <FilePicker label="Document File *" file={file} onChange={setFile} />

      <View style={styles.submitWrap}>
        <Button title="Upload Document" loading={isPending} onPress={() => { void handleSubmit(onSubmit)(); }} />
      </View>
    </ScrollView>
  );
}

const editSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  notes: z.string().optional(),
});
type EditFormData = z.infer<typeof editSchema>;

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
        <Input label="Name" value={value} onChangeText={onChange} error={errors.name?.message} />
      )} />
      <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
        <Input label="Description" value={value} onChangeText={onChange} multiline />
      )} />
      <Controller control={control} name="notes" render={({ field: { onChange, value } }) => (
        <Input label="Notes" value={value} onChangeText={onChange} multiline />
      )} />
      <View style={styles.submitWrap}>
        <Button title="Save Changes" loading={isPending} onPress={() => { void handleSubmit(onSubmit)(); }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  sectionLabel: { ...typography.label, color: colors.textSecondary, textTransform: 'uppercase', marginBottom: spacing.sm },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  catBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: spacing.sm, paddingVertical: 7,
    borderRadius: radius.full, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.surface,
  },
  catBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catBtnText: { ...typography.label, color: colors.textSecondary, fontSize: 11 },
  catBtnTextActive: { color: colors.white },
  submitWrap: { marginTop: spacing.md },
});

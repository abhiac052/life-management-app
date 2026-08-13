import React, { useState } from 'react';
import {
  Alert, FlatList, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useWarranties, useWarrantyDetail, useCreateWarranty, useUpdateWarranty, useDeleteWarranty } from '../hooks/useWarranties';
import { warrantiesService } from '../services/warranties.service';
import { EmptyState, LoadingSkeleton } from '../../../shared/components/Card';
import { DatePickerField } from '../../../shared/components/DatePickerField';
import { colors, spacing, typography, radius } from '../../../shared/theme';
import type { ManageStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<ManageStackParamList>;

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function ExpiryBadge({ dateStr }: { dateStr: string }) {
  const days = daysUntil(dateStr);
  const color = days < 0 ? colors.error : days <= 30 ? colors.warning : colors.success;
  const label = days < 0 ? 'Expired' : days === 0 ? 'Today' : `${days}d left`;
  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function WarrantyListScreen() {
  const navigation = useNavigation<Nav>();
  const { data, isLoading, refetch } = useWarranties();

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
          ListEmptyComponent={<EmptyState title="No warranties" description="Tap + to add a warranty" />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('WarrantyDetail', { id: item.id })} activeOpacity={0.8}>
              <Text style={styles.cardIcon}>🛡️</Text>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.productName}</Text>
                <Text style={styles.cardSub}>{[item.brand, item.model].filter(Boolean).join(' · ')}</Text>
                <Text style={styles.cardSub}>Expires {new Date(item.expiryDate).toLocaleDateString()}</Text>
              </View>
              <ExpiryBadge dateStr={item.expiryDate} />
            </TouchableOpacity>
          )}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateWarranty')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

export function WarrantyDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<ManageStackParamList, 'WarrantyDetail'>>();
  const { data: w, isLoading } = useWarrantyDetail(params.id);
  const { mutate: deleteWarranty } = useDeleteWarranty();

  if (isLoading) return <View style={styles.container}><LoadingSkeleton height={200} style={styles.skeleton} /></View>;
  if (!w) return null;

  const handleDelete = () => {
    Alert.alert('Delete warranty?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteWarranty(w.id, { onSuccess: () => navigation.goBack() }) },
    ]);
  };

  const handleInvoice = async () => {
    const { url } = await warrantiesService.getInvoiceUrl(w.id);
    await Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{w.productName}</Text>
          <ExpiryBadge dateStr={w.expiryDate} />
        </View>
        {w.brand && <Text style={styles.sub}>Brand: {w.brand}</Text>}
        {w.model && <Text style={styles.sub}>Model: {w.model}</Text>}
        {w.seller && <Text style={styles.sub}>Seller: {w.seller}</Text>}
        <Text style={styles.sub}>Purchased: {new Date(w.purchaseDate).toLocaleDateString()}</Text>
        <Text style={styles.sub}>Expires: {new Date(w.expiryDate).toLocaleDateString()}</Text>
        {w.notes && <Text style={styles.notes}>{w.notes}</Text>}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditWarranty', { id: w.id })}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        {w.invoiceFileName && (
          <TouchableOpacity style={styles.invoiceBtn} onPress={handleInvoice}>
            <Text style={styles.invoiceBtnText}>📄 Invoice</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export function CreateWarrantyScreen() {
  const navigation = useNavigation<Nav>();
  const { mutate: create, isPending } = useCreateWarranty();
  const [fields, setFields] = useState({ productName: '', brand: '', model: '', purchaseDate: '', expiryDate: '', seller: '', notes: '' });
  const set = (k: keyof typeof fields) => (v: string) => setFields((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!fields.productName.trim() || !fields.purchaseDate || !fields.expiryDate) {
      Alert.alert('Required', 'Product name, purchase date and expiry date are required'); return;
    }
    create({
      productName: fields.productName.trim(),
      brand: fields.brand || undefined, model: fields.model || undefined,
      purchaseDate: fields.purchaseDate, expiryDate: fields.expiryDate,
      seller: fields.seller || undefined, notes: fields.notes || undefined,
    }, { onSuccess: () => navigation.goBack() });
  };

  return <WarrantyForm fields={fields} set={set} onSubmit={handleSubmit} isPending={isPending} submitLabel="Add Warranty" />;
}

export function EditWarrantyScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<ManageStackParamList, 'EditWarranty'>>();
  const { data: w } = useWarrantyDetail(params.id);
  const { mutate: update, isPending } = useUpdateWarranty(params.id);
  const [fields, setFields] = useState({ productName: '', brand: '', model: '', purchaseDate: '', expiryDate: '', seller: '', notes: '' });
  const set = (k: keyof typeof fields) => (v: string) => setFields((f) => ({ ...f, [k]: v }));

  React.useEffect(() => {
    if (w) setFields({
      productName: w.productName, brand: w.brand ?? '', model: w.model ?? '',
      purchaseDate: w.purchaseDate.split('T')[0], expiryDate: w.expiryDate.split('T')[0],
      seller: w.seller ?? '', notes: w.notes ?? '',
    });
  }, [w?.id]);

  const handleSubmit = () => {
    update({
      productName: fields.productName.trim(), brand: fields.brand || undefined,
      model: fields.model || undefined, purchaseDate: fields.purchaseDate,
      expiryDate: fields.expiryDate, seller: fields.seller || undefined, notes: fields.notes || undefined,
    }, { onSuccess: () => navigation.goBack() });
  };

  return <WarrantyForm fields={fields} set={set} onSubmit={handleSubmit} isPending={isPending} submitLabel="Save Changes" />;
}

type WarrantyFields = { productName: string; brand: string; model: string; purchaseDate: string; expiryDate: string; seller: string; notes: string };

function WarrantyForm({ fields, set, onSubmit, isPending, submitLabel }: {
  fields: WarrantyFields;
  set: (k: keyof WarrantyFields) => (v: string) => void;
  onSubmit: () => void; isPending: boolean; submitLabel: string;
}) {
  const formFields = [
    { key: 'productName', label: 'Product Name *', placeholder: 'e.g. Samsung TV' },
    { key: 'brand', label: 'Brand', placeholder: 'Samsung' },
    { key: 'model', label: 'Model', placeholder: 'QN55Q80C' },
    { key: 'seller', label: 'Seller', placeholder: 'Amazon / Store name' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {formFields.map((f) => (
        <View key={f.key}>
          <Text style={styles.label}>{f.label}</Text>
          <TextInput style={styles.input} value={fields[f.key as keyof WarrantyFields]} onChangeText={set(f.key as keyof WarrantyFields)} placeholder={f.placeholder} />
        </View>
      ))}
      <DatePickerField label="Purchase Date *" value={fields.purchaseDate} onChange={set('purchaseDate')} />
      <DatePickerField label="Warranty Expiry *" value={fields.expiryDate} onChange={set('expiryDate')} />
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
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full },
  badgeText: { ...typography.label, fontWeight: '600' },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.lg, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
  headerCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { ...typography.h2, color: colors.text, flex: 1 },
  sub: { ...typography.body, color: colors.textSecondary },
  notes: { ...typography.bodySmall, color: colors.textDisabled, marginTop: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  editBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  editBtnText: { ...typography.button, color: '#fff' },
  invoiceBtn: { flex: 1, backgroundColor: colors.info + '20', borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  invoiceBtnText: { ...typography.button, color: colors.info },
  deleteBtn: { flex: 1, backgroundColor: colors.error + '20', borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  deleteBtnText: { ...typography.button, color: colors.error },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.xs },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.sm, ...typography.body, color: colors.text },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.md },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { ...typography.button, color: '#fff' },
});

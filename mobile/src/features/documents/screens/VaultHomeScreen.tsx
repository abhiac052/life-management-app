import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDocuments } from '../hooks/useDocuments';
import { EmptyState, LoadingSkeleton } from '../../../shared/components/Card';
import { colors, spacing, typography } from '../../../shared/theme';
import type { VaultStackParamList } from '../../../app/navigation/types';
import type { Document } from '../services/documents.service';

type Nav = NativeStackNavigationProp<VaultStackParamList>;

const CATEGORIES = ['ALL', 'AADHAAR', 'PAN', 'PASSPORT', 'DRIVING_LICENCE', 'INSURANCE', 'PROPERTY', 'EDUCATION', 'MEDICAL', 'VEHICLE', 'OTHER'];

export function VaultHomeScreen() {
  const navigation = useNavigation<Nav>();
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useDocuments({ category, search: search || undefined });

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search documents..."
        placeholderTextColor={colors.textDisabled}
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={c => c}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catBtn, (item === 'ALL' ? !category : category === item) && styles.catActive]}
            onPress={() => setCategory(item === 'ALL' ? undefined : item)}
          >
            <Text style={[styles.catText, (item === 'ALL' ? !category : category === item) && styles.catTextActive]}>
              {item.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        )}
      />

      {isLoading ? (
        <View style={styles.skeletons}>
          {[1, 2, 3].map(i => <LoadingSkeleton key={i} height={72} style={styles.skeleton} />)}
        </View>
      ) : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState title="No documents" description="Tap + to upload one" />}
          renderItem={({ item }) => (
            <DocumentCard item={item} onPress={() => navigation.navigate('DocumentDetail', { id: item.id })} />
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateDocument')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function DocumentCard({ item, onPress }: { item: Document; onPress: () => void }) {
  const isExpiringSoon = item.expiryDate && new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardIcon}>
        <Text style={styles.cardIconText}>{item.mimeType === 'application/pdf' ? '📄' : '🖼'}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardCategory}>{item.category.replace('_', ' ')}</Text>
        {item.expiryDate && (
          <Text style={[styles.cardExpiry, isExpired ? styles.expired : isExpiringSoon ? styles.expiringSoon : null]}>
            {isExpired ? '⚠ Expired' : isExpiringSoon ? '⚠ Expiring soon' : `Expires ${new Date(item.expiryDate).toLocaleDateString()}`}
          </Text>
        )}
      </View>
      <Text style={styles.fileSize}>{(item.fileSize / 1024).toFixed(0)}KB</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  search: { margin: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border, ...typography.body, color: colors.text },
  categories: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: spacing.sm },
  catBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  catActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catText: { ...typography.label, color: colors.textSecondary },
  catTextActive: { color: '#fff' },
  list: { padding: spacing.md, gap: spacing.sm },
  skeletons: { padding: spacing.md, gap: spacing.sm },
  skeleton: { borderRadius: 10, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: 10, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  cardIconText: { fontSize: 22 },
  cardContent: { flex: 1 },
  cardName: { ...typography.body, color: colors.text, fontWeight: '600' },
  cardCategory: { ...typography.label, color: colors.textSecondary, marginTop: 2 },
  cardExpiry: { ...typography.label, color: colors.textSecondary, marginTop: 2 },
  expiringSoon: { color: colors.warning },
  expired: { color: colors.error },
  fileSize: { ...typography.label, color: colors.textDisabled },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.lg, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
});

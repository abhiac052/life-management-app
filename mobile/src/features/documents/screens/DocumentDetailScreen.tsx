import React from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useDocumentDetail, useDocumentDownloadUrl, useDeleteDocument, useRestoreDocument } from '../hooks/useDocuments';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { colors, spacing, typography } from '../../../shared/theme';
import type { VaultStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<VaultStackParamList>;
type Route = RouteProp<VaultStackParamList, 'DocumentDetail'>;

export function DocumentDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { data: doc, isLoading } = useDocumentDetail(params.id);
  const { data: urlData } = useDocumentDownloadUrl(params.id);
  const { mutate: deleteDoc } = useDeleteDocument();
  const { mutate: restoreDoc } = useRestoreDocument();

  if (isLoading || !doc) return <ActivityIndicator style={styles.loader} color={colors.primary} />;

  const handleDelete = () => {
    Alert.alert('Delete Document', 'Move to trash?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteDoc(doc.id); navigation.goBack(); } },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.name}>{doc.name}</Text>
        <Text style={styles.category}>{doc.category.replace('_', ' ')}</Text>
        {doc.description && <Text style={styles.desc}>{doc.description}</Text>}

        <View style={styles.meta}>
          <MetaRow label="File" value={doc.fileName} />
          <MetaRow label="Size" value={`${(doc.fileSize / 1024).toFixed(1)} KB`} />
          <MetaRow label="Type" value={doc.mimeType} />
          {doc.issueDate && <MetaRow label="Issue Date" value={new Date(doc.issueDate).toLocaleDateString()} />}
          {doc.expiryDate && <MetaRow label="Expiry Date" value={new Date(doc.expiryDate).toLocaleDateString()} />}
          {doc.tags.length > 0 && <MetaRow label="Tags" value={doc.tags.join(', ')} />}
          {doc.notes && <MetaRow label="Notes" value={doc.notes} />}
          <MetaRow label="Added" value={new Date(doc.createdAt).toLocaleDateString()} />
        </View>
      </Card>

      {urlData?.url && (
        <Button title="View / Download" onPress={() => { void Linking.openURL(urlData.url); }} />
      )}

      {doc.deletedAt ? (
        <Button title="Restore Document" variant="outline" onPress={() => { restoreDoc(doc.id); navigation.goBack(); }} />
      ) : (
        <View style={styles.row}>
          <Button title="Edit" variant="outline" style={styles.flex} onPress={() => navigation.navigate('EditDocument', { id: doc.id })} />
          <Button title="Delete" variant="danger" style={styles.flex} onPress={handleDelete} />
        </View>
      )}
    </ScrollView>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  loader: { flex: 1 },
  name: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
  category: { ...typography.label, color: colors.primary, marginBottom: spacing.md },
  desc: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md },
  meta: { gap: spacing.sm },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  metaLabel: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  metaValue: { ...typography.bodySmall, color: colors.text, fontWeight: '500', flex: 2, textAlign: 'right' },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});

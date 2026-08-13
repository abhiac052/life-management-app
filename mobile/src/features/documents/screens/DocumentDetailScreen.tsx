import React, { useEffect, useRef } from 'react';
import {
  Animated, ActivityIndicator, Alert, Linking,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import {
  useDocumentDetail, useDocumentDownloadUrl,
  useDeleteDocument, useRestoreDocument,
} from '../hooks/useDocuments';
import { Icon } from '../../../shared/components/Icon';
import { colors, spacing, typography, radius, shadows } from '../../../shared/theme';
import type { VaultStackParamList } from '../../../app/navigation/types';

type Nav   = NativeStackNavigationProp<VaultStackParamList>;
type Route = RouteProp<VaultStackParamList, 'DocumentDetail'>;

const DOC_COLORS: Record<string, string> = {
  AADHAAR: '#E8441A', PAN: '#0A84FF', PASSPORT: '#1DB954',
  DRIVING_LICENCE: '#FF9500', INSURANCE: '#5856D6', PROPERTY: '#34C759',
  EDUCATION: '#FF2D55', MEDICAL: '#FF3B30', VEHICLE: '#007AFF', OTHER: '#8E8E93',
};
const DOC_ICONS: Record<string, string> = {
  AADHAAR: 'card-account-details-outline', PAN: 'credit-card-outline',
  PASSPORT: 'passport', DRIVING_LICENCE: 'car-key',
  INSURANCE: 'shield-check-outline', PROPERTY: 'home-outline',
  EDUCATION: 'school-outline', MEDICAL: 'heart-pulse',
  VEHICLE: 'car-outline', OTHER: 'file-document-outline',
};

function MetaRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Icon name={icon} size={15} color={colors.textDisabled} />
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

export function DocumentDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { data: doc, isLoading } = useDocumentDetail(params.id);
  const { data: urlData } = useDocumentDownloadUrl(params.id);
  const { mutate: deleteDoc } = useDeleteDocument();
  const { mutate: restoreDoc } = useRestoreDocument();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, tension: 70, friction: 12, useNativeDriver: true }).start();
  }, []);

  if (isLoading || !doc) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const iconColor = DOC_COLORS[doc.category] ?? colors.textSecondary;
  const iconName  = DOC_ICONS[doc.category]  ?? 'file-document-outline';
  const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
  const daysLeft  = doc.expiryDate
    ? Math.ceil((new Date(doc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const handleDelete = () => {
    Alert.alert('Delete Document', 'Move to trash?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteDoc(doc.id); navigation.goBack(); } },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Hero card */}
      <Animated.View style={[styles.heroCard, {
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
      }]}>
        <View style={[styles.heroIcon, { backgroundColor: iconColor + '18' }]}>
          <Icon name={iconName} size={36} color={iconColor} />
        </View>
        <Text style={styles.heroName}>{doc.name}</Text>
        <View style={[styles.catBadge, { backgroundColor: iconColor + '15' }]}>
          <Text style={[styles.catBadgeText, { color: iconColor }]}>
            {doc.category.replace('_', ' ')}
          </Text>
        </View>
        {doc.description && <Text style={styles.heroDesc}>{doc.description}</Text>}

        {doc.expiryDate && (
          <View style={[styles.expiryRow, { backgroundColor: isExpired ? colors.errorLight : colors.warningLight }]}>
            <Icon name={isExpired ? 'alert-circle' : 'clock-outline'} size={14} color={isExpired ? colors.error : colors.warning} />
            <Text style={[styles.expiryText, { color: isExpired ? colors.error : colors.warning }]}>
              {isExpired
                ? `Expired ${Math.abs(daysLeft!)} days ago`
                : daysLeft === 0 ? 'Expires today'
                : `Expires in ${daysLeft} days · ${new Date(doc.expiryDate).toLocaleDateString()}`}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Meta */}
      <Animated.View style={[styles.metaCard, { opacity: anim }]}>
        <Text style={styles.metaSectionTitle}>Details</Text>
        <MetaRow icon="file-outline"       label="File"    value={doc.fileName} />
        <MetaRow icon="database-outline"   label="Size"    value={`${(doc.fileSize / 1024).toFixed(1)} KB`} />
        <MetaRow icon="code-tags"          label="Type"    value={doc.mimeType} />
        {doc.issueDate  && <MetaRow icon="calendar-plus-outline"  label="Issued"   value={new Date(doc.issueDate).toLocaleDateString()} />}
        {doc.expiryDate && <MetaRow icon="calendar-remove-outline" label="Expires"  value={new Date(doc.expiryDate).toLocaleDateString()} />}
        {doc.tags.length > 0 && <MetaRow icon="tag-multiple-outline" label="Tags" value={doc.tags.join(', ')} />}
        {doc.notes && <MetaRow icon="note-text-outline" label="Notes" value={doc.notes} />}
        <MetaRow icon="clock-outline" label="Added" value={new Date(doc.createdAt).toLocaleDateString()} />
      </Animated.View>

      {/* Actions */}
      <Animated.View style={[styles.actions, { opacity: anim }]}>
        {urlData?.url && (
          <TouchableOpacity style={styles.downloadBtn} onPress={() => { void Linking.openURL(urlData.url); }} activeOpacity={0.85}>
            <Icon name="download-outline" size={18} color={colors.white} />
            <Text style={styles.downloadBtnText}>View / Download</Text>
          </TouchableOpacity>
        )}

        {doc.deletedAt ? (
          <TouchableOpacity style={styles.restoreBtn} onPress={() => { restoreDoc(doc.id); navigation.goBack(); }} activeOpacity={0.85}>
            <Icon name="restore" size={18} color={colors.primary} />
            <Text style={styles.restoreBtnText}>Restore Document</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editDeleteRow}>
            <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditDocument', { id: doc.id })} activeOpacity={0.85}>
              <Icon name="pencil-outline" size={16} color={colors.primary} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.85}>
              <Icon name="trash-can-outline" size={16} color={colors.error} />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },

  heroCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: spacing.lg, alignItems: 'center', gap: spacing.sm, ...shadows.md,
  },
  heroIcon: { width: 80, height: 80, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  heroName: { ...typography.h2, color: colors.text, textAlign: 'center' },
  catBadge: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.full },
  catBadgeText: { ...typography.label, fontWeight: '700', textTransform: 'uppercase' },
  heroDesc: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  expiryRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.md, marginTop: spacing.xs,
  },
  expiryText: { ...typography.bodySmall, fontWeight: '600' },

  metaCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm, ...shadows.sm },
  metaSectionTitle: { ...typography.label, color: colors.textSecondary, textTransform: 'uppercase', marginBottom: spacing.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs, borderTopWidth: 1, borderTopColor: colors.divider },
  metaLabel: { ...typography.bodySmall, color: colors.textSecondary, width: 64 },
  metaValue: { ...typography.bodySmall, color: colors.text, fontWeight: '500', flex: 1, textAlign: 'right' },

  actions: { gap: spacing.sm },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: 16,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  downloadBtnText: { ...typography.button, color: colors.white },
  restoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.primaryGlow, borderRadius: radius.lg, paddingVertical: 16,
    borderWidth: 1.5, borderColor: colors.primary,
  },
  restoreBtnText: { ...typography.button, color: colors.primary },
  editDeleteRow: { flexDirection: 'row', gap: spacing.sm },
  editBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    backgroundColor: colors.primaryGlow, borderRadius: radius.lg, paddingVertical: 14,
    borderWidth: 1.5, borderColor: colors.primary,
  },
  editBtnText: { ...typography.button, color: colors.primary },
  deleteBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    backgroundColor: colors.errorLight, borderRadius: radius.lg, paddingVertical: 14,
    borderWidth: 1.5, borderColor: colors.error + '40',
  },
  deleteBtnText: { ...typography.button, color: colors.error },
});

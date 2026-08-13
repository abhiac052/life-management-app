import React, { useRef, useEffect } from 'react';
import { Animated, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useDocuments } from '../hooks/useDocuments';
import { LoadingSkeleton, EmptyState } from '../../../shared/components/Card';
import { Icon } from '../../../shared/components/Icon';
import { colors, spacing, typography, radius, shadows } from '../../../shared/theme';
import type { VaultStackParamList } from '../../../app/navigation/types';
import type { Document } from '../services/documents.service';

type Nav   = NativeStackNavigationProp<VaultStackParamList>;
type Route = RouteProp<VaultStackParamList, 'CategoryDocuments'>;

const DOC_ICONS: Record<string, string> = {
  AADHAAR: 'card-account-details-outline', PAN: 'credit-card-outline',
  PASSPORT: 'passport', DRIVING_LICENCE: 'car-key',
  INSURANCE: 'shield-check-outline', PROPERTY: 'home-outline',
  EDUCATION: 'school-outline', MEDICAL: 'heart-pulse',
  VEHICLE: 'car-outline', OTHER: 'file-document-outline',
};
const DOC_COLORS: Record<string, string> = {
  AADHAAR: '#E8441A', PAN: '#0A84FF', PASSPORT: '#1DB954',
  DRIVING_LICENCE: '#FF9500', INSURANCE: '#5856D6', PROPERTY: '#34C759',
  EDUCATION: '#FF2D55', MEDICAL: '#FF3B30', VEHICLE: '#007AFF', OTHER: '#8E8E93',
};

function DocCard({ item, index, onPress }: { item: Document; index: number; onPress: () => void }) {
  const anim  = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1, tension: 80, friction: 12,
      delay: index * 60, useNativeDriver: true,
    }).start();
  }, []);

  const iconColor = DOC_COLORS[item.category] ?? colors.textSecondary;
  const iconName  = DOC_ICONS[item.category]  ?? 'file-document-outline';
  const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
  const isExpiringSoon = !isExpired && item.expiryDate &&
    new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const daysLeft = item.expiryDate
    ? Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Animated.View style={{
      opacity: anim,
      transform: [
        { scale },
        { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
      ],
    }}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.97, tension: 200, friction: 10, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1,    tension: 200, friction: 10, useNativeDriver: true }).start()}
        activeOpacity={1}
      >
        <View style={[styles.docIconBox, { backgroundColor: iconColor + '15' }]}>
          <Icon name={iconName} size={22} color={iconColor} />
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardSize}>{(item.fileSize / 1024).toFixed(0)} KB</Text>
        </View>

        {item.expiryDate && (
          <View style={[styles.expiryBadge, {
            backgroundColor: isExpired ? colors.errorLight : isExpiringSoon ? colors.warningLight : colors.backgroundSecondary,
          }]}>
            <Icon
              name={isExpired ? 'alert-circle' : isExpiringSoon ? 'clock-alert-outline' : 'calendar-check-outline'}
              size={12}
              color={isExpired ? colors.error : isExpiringSoon ? colors.warning : colors.textDisabled}
            />
            <Text style={[styles.expiryText, {
              color: isExpired ? colors.error : isExpiringSoon ? colors.warning : colors.textDisabled,
            }]}>
              {isExpired ? 'Expired' : daysLeft === 0 ? 'Today' : `${daysLeft}d`}
            </Text>
          </View>
        )}

        <Icon name="chevron-right" size={18} color={colors.textDisabled} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function CategoryDocumentsScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { data, isLoading } = useDocuments({ category: params.category });
  const docs = Array.isArray(data?.data) ? data!.data : [];

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.skeletons}>
          {[1, 2, 3, 4].map(i => <LoadingSkeleton key={i} height={76} style={styles.skeleton} />)}
        </View>
      ) : (
        <FlatList
          data={docs}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title={`No ${params.label} documents`}
              description="Tap + to upload your first document"
            />
          }
          renderItem={({ item, index }) => (
            <DocCard
              item={item}
              index={index}
              onPress={() => navigation.navigate('DocumentDetail', { id: item.id })}
            />
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateDocument')}
        activeOpacity={0.85}
      >
        <Icon name="plus" size={26} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  skeletons: { padding: spacing.md, gap: spacing.sm },
  skeleton: { borderRadius: radius.lg, marginBottom: spacing.xs },

  list: { padding: spacing.md, paddingBottom: 100, gap: spacing.sm },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, ...shadows.sm,
  },
  docIconBox: {
    width: 48, height: 48, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardName: { ...typography.body, color: colors.text, fontWeight: '600', marginBottom: 4 },
  cardSize: { ...typography.caption, color: colors.textDisabled },

  expiryBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full,
  },
  expiryText: { ...typography.label, fontSize: 10, fontWeight: '700' },

  fab: {
    position: 'absolute', bottom: spacing.xl, right: spacing.lg,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
});

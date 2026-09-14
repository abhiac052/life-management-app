import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, StyleSheet, Text, TouchableOpacity, View, StatusBar, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDocuments } from '../hooks/useDocuments';
import { Icon } from '../../../shared/components/Icon';
import { spacing, typography, radius, shadows } from '../../../shared/theme';
import { useTheme } from '../../../shared/theme/ThemeContext';
import type { VaultStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<VaultStackParamList>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.md * 2 - spacing.sm) / 2;

const CATEGORIES = [
  { key: 'AADHAAR',         label: 'Aadhaar',   icon: 'card-account-details-outline', color: '#E8441A' },
  { key: 'PAN',             label: 'PAN Card',  icon: 'credit-card-outline',           color: '#0A84FF' },
  { key: 'PASSPORT',        label: 'Passport',  icon: 'passport',                      color: '#1DB954' },
  { key: 'DRIVING_LICENCE', label: 'Licence',   icon: 'car-key',                       color: '#FF9500' },
  { key: 'INSURANCE',       label: 'Insurance', icon: 'shield-check-outline',          color: '#5856D6' },
  { key: 'PROPERTY',        label: 'Property',  icon: 'home-outline',                  color: '#34C759' },
  { key: 'EDUCATION',       label: 'Education', icon: 'school-outline',                color: '#FF2D55' },
  { key: 'MEDICAL',         label: 'Medical',   icon: 'heart-pulse',                   color: '#FF3B30' },
  { key: 'VEHICLE',         label: 'Vehicle',   icon: 'car-outline',                   color: '#007AFF' },
  { key: 'OTHER',           label: 'Other',     icon: 'file-document-outline',         color: '#8E8E93' },
];

function ShimmerBlock({ delay, colors }: { delay: number; colors: any }) {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, delay, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });
  return (
    <Animated.View style={[styles.shimmerBlock, { opacity, width: CARD_WIDTH, backgroundColor: colors.backgroundSecondary }]}>
      <View style={[styles.shimmerIcon, { backgroundColor: colors.border }]} />
      <View style={[styles.shimmerLine, { backgroundColor: colors.border }]} />
      <View style={[styles.shimmerLineShort, { backgroundColor: colors.border }]} />
    </Animated.View>
  );
}

function CategoryBlock({ cat, count, index, onPress, colors }: {
  cat: typeof CATEGORIES[0]; count: number; index: number; onPress: () => void; colors: any;
}) {
  const anim  = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 400, delay: index * 50, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={{ opacity: anim, transform: [{ scale }, { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }], width: CARD_WIDTH }}>
      <TouchableOpacity
        style={[styles.block, { backgroundColor: colors.surface }]}
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.95, tension: 200, friction: 10, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }).start()}
        activeOpacity={1}
      >
        <View style={[styles.iconBox, { backgroundColor: cat.color + '18' }]}>
          <Icon name={cat.icon} size={28} color={cat.color} />
        </View>
        <Text style={[styles.blockLabel, { color: colors.text }]} numberOfLines={1}>{cat.label}</Text>
        <View style={styles.blockFooter}>
          <Text style={[styles.blockCount, { color: cat.color }]}>{count}</Text>
          <Text style={[styles.blockCountLabel, { color: colors.textSecondary }]}> {count === 1 ? 'doc' : 'docs'}</Text>
        </View>
        <View style={[styles.blockAccent, { backgroundColor: cat.color }]} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function VaultHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { data, isLoading } = useDocuments({});
  const { colors } = useTheme();
  const [ready, setReady] = useState(false);
  const headerAnim  = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        setReady(true);
        Animated.timing(contentAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
      }, 150);
    }
  }, [isLoading]);

  const docs       = Array.isArray(data?.data) ? data!.data : [];
  const totalCount = docs.length;
  const countFor   = (key: string) => docs.filter(d => d.category === key).length;
  const skeletonOpacity = contentAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.headerBg, { backgroundColor: colors.primary }]} />

      <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }] }]}>
        <View>
          <Text style={styles.headerLabel}>Secure Storage</Text>
          <Text style={styles.headerTitle}>My Vault</Text>
        </View>
        <View style={styles.headerCount}>
          <Text style={styles.headerCountNum}>{totalCount}</Text>
          <Text style={styles.headerCountSub}>docs</Text>
        </View>
      </Animated.View>

      {!ready && (
        <Animated.View style={[styles.skeletonWrap, { opacity: skeletonOpacity }]}>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <View key={i} style={styles.skeletonRow}>
              <ShimmerBlock delay={i * 80} colors={colors} />
              <ShimmerBlock delay={i * 80 + 40} colors={colors} />
            </View>
          ))}
        </Animated.View>
      )}

      {ready && (
        <Animated.View style={{ flex: 1, opacity: contentAnim }}>
          <FlatList
            data={CATEGORIES}
            keyExtractor={item => item.key}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <CategoryBlock
                cat={item} count={countFor(item.key)} index={index} colors={colors}
                onPress={() => navigation.navigate('CategoryDocuments', { category: item.key, label: item.label })}
              />
            )}
          />
        </Animated.View>
      )}

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('CreateDocument')} activeOpacity={0.85}>
        <Icon name="plus" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: spacing.lg + spacing.sm, paddingBottom: spacing.md },
  headerLabel:    { ...typography.label, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: spacing.xs },
  headerTitle:    { ...typography.h2, color: '#FFFFFF' },
  headerCount:    { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  headerCountNum: { ...typography.h3, color: '#FFFFFF', fontWeight: '800' },
  headerCountSub: { ...typography.caption, color: 'rgba(255,255,255,0.7)' },
  skeletonWrap: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  skeletonRow:  { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  shimmerBlock: { height: 130, borderRadius: radius.xl, padding: spacing.md, gap: spacing.sm },
  shimmerIcon:      { width: 48, height: 48, borderRadius: radius.lg },
  shimmerLine:      { width: '70%', height: 12, borderRadius: radius.sm },
  shimmerLineShort: { width: '40%', height: 10, borderRadius: radius.sm },
  grid: { paddingHorizontal: spacing.md, paddingBottom: 100, paddingTop: spacing.sm },
  row:  { gap: spacing.sm, marginBottom: spacing.sm },
  block: { borderRadius: radius.xl, padding: spacing.md, overflow: 'hidden', ...shadows.sm },
  iconBox: { width: 56, height: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  blockLabel:      { ...typography.body, fontWeight: '700', marginBottom: 4 },
  blockFooter:     { flexDirection: 'row', alignItems: 'baseline' },
  blockCount:      { ...typography.h3, fontWeight: '800' },
  blockCountLabel: { ...typography.caption },
  blockAccent:     { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3 },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.lg, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#E8441A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
});

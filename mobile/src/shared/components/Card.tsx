import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, ViewProps } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../theme';

// ── Card ─────────────────────────────────────────────────────────────────────

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description && <Text style={styles.emptyDesc}>{description}</Text>}
      {action && <View style={styles.emptyAction}>{action}</View>}
    </View>
  );
}

// ── LoadingSkeleton ───────────────────────────────────────────────────────────

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function LoadingSkeleton({ width = '100%', height = 16, borderRadius = 6, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as number, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { ...typography.h3, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  emptyDesc: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  emptyAction: { marginTop: spacing.lg },
  skeleton: { backgroundColor: colors.border },
});

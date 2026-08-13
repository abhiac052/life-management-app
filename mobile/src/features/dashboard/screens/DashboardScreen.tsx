import React from 'react';
import {
  RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDashboard } from '../hooks/useDashboard';
import { LoadingSkeleton } from '../../../shared/components/Card';
import { colors, spacing, typography, radius, shadows } from '../../../shared/theme';
import type { HomeStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function SectionHeader({ title, count, color }: { title: string; count?: number; color?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {count !== undefined && count > 0 && (
        <View style={[styles.countBadge, { backgroundColor: (color ?? colors.primary) + '20' }]}>
          <Text style={[styles.countBadgeText, { color: color ?? colors.primary }]}>{count}</Text>
        </View>
      )}
    </View>
  );
}

export function DashboardScreen() {
  const { data, isLoading, refetch, isRefetching } = useDashboard();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning 🌅';
    if (h < 17) return 'Good afternoon ☀️';
    return 'Good evening 🌙';
  };

  if (isLoading) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>{greeting()}</Text>
        {[1, 2, 3, 4].map((i) => <LoadingSkeleton key={i} height={100} style={styles.skeleton} />)}
      </ScrollView>
    );
  }

  if (!data) return null;

  const { doses, reminders, appointments, expiringDocs, expiringWarranties, vehicleAlerts } = data;
  const hasAlerts = reminders.overdue > 0 || expiringDocs.length > 0 || expiringWarranties.length > 0 || vehicleAlerts.length > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => { void refetch(); }} />}
    >
      <Text style={styles.greeting}>{greeting()}</Text>

      {/* Overdue alert banner */}
      {reminders.overdue > 0 && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>⚠️ {reminders.overdue} overdue reminder{reminders.overdue > 1 ? 's' : ''}</Text>
        </View>
      )}

      {/* Today's Doses */}
      <View style={styles.card}>
        <SectionHeader title="Today's Doses" count={doses.pending} color={doses.pending > 0 ? colors.warning : colors.success} />
        <View style={styles.doseRow}>
          <DoseStat label="Total" value={doses.total} color={colors.primary} />
          <DoseStat label="Taken" value={doses.taken} color={colors.success} />
          <DoseStat label="Pending" value={doses.pending} color={doses.pending > 0 ? colors.warning : colors.textDisabled} />
        </View>
        {doses.nextDose && (
          <View style={styles.nextDose}>
            <Text style={styles.nextDoseLabel}>Next: </Text>
            <Text style={styles.nextDoseText}>{doses.nextDose.medicineName} at {doses.nextDose.time}</Text>
          </View>
        )}
        {doses.total === 0 && (
          <Text style={styles.emptyText}>No medicines scheduled today</Text>
        )}
      </View>

      {/* Upcoming Reminders */}
      {reminders.upcoming.length > 0 && (
        <View style={styles.card}>
          <SectionHeader title="Upcoming Reminders" />
          {reminders.upcoming.map((r) => {
            const due = new Date(r.dueDate);
            const days = daysUntil(r.dueDate);
            const dueLabel = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`;
            return (
              <View key={r.id} style={styles.listRow}>
                <View style={styles.listRowLeft}>
                  <Text style={styles.listRowTitle} numberOfLines={1}>{r.title}</Text>
                  <Text style={styles.listRowSub}>{due.toLocaleDateString()} {due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <Text style={[styles.dueChip, { color: days <= 1 ? colors.warning : colors.textSecondary }]}>{dueLabel}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Upcoming Appointments */}
      {appointments.length > 0 && (
        <View style={styles.card}>
          <SectionHeader title="Upcoming Appointments" />
          {appointments.map((a) => (
            <View key={a.id} style={styles.listRow}>
              <View style={styles.listRowLeft}>
                <Text style={styles.listRowTitle}>{a.doctorName}</Text>
                <Text style={styles.listRowSub}>{new Date(a.date).toLocaleDateString()} at {a.time}{a.purpose ? ` · ${a.purpose}` : ''}</Text>
              </View>
              <Text style={styles.dueChip}>{daysUntil(a.date)}d</Text>
            </View>
          ))}
        </View>
      )}

      {/* Expiring Documents */}
      {expiringDocs.length > 0 && (
        <View style={styles.card}>
          <SectionHeader title="Documents Expiring Soon" count={expiringDocs.length} color={colors.warning} />
          {expiringDocs.map((d) => {
            const days = daysUntil(d.expiryDate);
            return (
              <View key={d.id} style={styles.listRow}>
                <View style={styles.listRowLeft}>
                  <Text style={styles.listRowTitle}>{d.name}</Text>
                  <Text style={styles.listRowSub}>{d.category} · expires {new Date(d.expiryDate).toLocaleDateString()}</Text>
                </View>
                <Text style={[styles.dueChip, { color: days <= 7 ? colors.error : colors.warning }]}>{days}d</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Expiring Warranties */}
      {expiringWarranties.length > 0 && (
        <View style={styles.card}>
          <SectionHeader title="Warranties Expiring Soon" count={expiringWarranties.length} color={colors.warning} />
          {expiringWarranties.map((w) => {
            const days = daysUntil(w.expiryDate);
            return (
              <View key={w.id} style={styles.listRow}>
                <View style={styles.listRowLeft}>
                  <Text style={styles.listRowTitle}>{w.productName}</Text>
                  <Text style={styles.listRowSub}>Expires {new Date(w.expiryDate).toLocaleDateString()}</Text>
                </View>
                <Text style={[styles.dueChip, { color: days <= 7 ? colors.error : colors.warning }]}>{days}d</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Vehicle Alerts */}
      {vehicleAlerts.length > 0 && (
        <View style={styles.card}>
          <SectionHeader title="Vehicle Alerts" count={vehicleAlerts.length} color={colors.warning} />
          {vehicleAlerts.map((v) => {
            const alerts = [
              v.insuranceExpiry && { label: 'Insurance', date: v.insuranceExpiry },
              v.pucExpiry && { label: 'PUC', date: v.pucExpiry },
              v.nextServiceDate && { label: 'Service', date: v.nextServiceDate },
            ].filter(Boolean) as { label: string; date: string }[];
            return alerts.map((a) => {
              const days = daysUntil(a.date);
              if (days > 30) return null;
              return (
                <View key={`${v.id}-${a.label}`} style={styles.listRow}>
                  <View style={styles.listRowLeft}>
                    <Text style={styles.listRowTitle}>{v.name} — {a.label}</Text>
                    <Text style={styles.listRowSub}>{new Date(a.date).toLocaleDateString()}</Text>
                  </View>
                  <Text style={[styles.dueChip, { color: days <= 7 ? colors.error : colors.warning }]}>{days}d</Text>
                </View>
              );
            });
          })}
        </View>
      )}

      {/* All clear */}
      {!hasAlerts && doses.pending === 0 && reminders.upcoming.length === 0 && appointments.length === 0 && (
        <View style={styles.allClear}>
          <Text style={styles.allClearIcon}>✅</Text>
          <Text style={styles.allClearText}>All clear! Nothing needs attention.</Text>
        </View>
      )}
    </ScrollView>
  );
}

function DoseStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.doseStat}>
      <Text style={[styles.doseStatValue, { color }]}>{value}</Text>
      <Text style={styles.doseStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  greeting: { ...typography.h2, color: colors.text },
  skeleton: { borderRadius: radius.md },
  alertBanner: {
    backgroundColor: colors.error + '15', borderRadius: radius.md,
    padding: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.error,
  },
  alertText: { ...typography.body, color: colors.error, fontWeight: '600' },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, ...shadows.sm, gap: spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { ...typography.h3, color: colors.text },
  countBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  countBadgeText: { ...typography.label, fontWeight: '700' },
  doseRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: spacing.xs },
  doseStat: { alignItems: 'center' },
  doseStatValue: { ...typography.h2, fontWeight: '700' },
  doseStatLabel: { ...typography.label, color: colors.textSecondary, marginTop: 2 },
  nextDose: { flexDirection: 'row', backgroundColor: colors.primary + '10', borderRadius: radius.sm, padding: spacing.sm },
  nextDoseLabel: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  nextDoseText: { ...typography.bodySmall, color: colors.primary },
  emptyText: { ...typography.bodySmall, color: colors.textDisabled, textAlign: 'center', paddingVertical: spacing.xs },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs, borderTopWidth: 1, borderTopColor: colors.divider },
  listRowLeft: { flex: 1 },
  listRowTitle: { ...typography.body, color: colors.text, fontWeight: '500' },
  listRowSub: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  dueChip: { ...typography.label, fontWeight: '600', color: colors.textSecondary, minWidth: 32, textAlign: 'right' },
  allClear: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  allClearIcon: { fontSize: 48 },
  allClearText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});

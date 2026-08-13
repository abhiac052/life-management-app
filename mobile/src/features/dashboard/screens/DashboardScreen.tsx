import React, { useEffect, useRef } from 'react';
import {
  Animated, RefreshControl, ScrollView, StyleSheet, Text, View, StatusBar,
} from 'react-native';
import { useDashboard } from '../hooks/useDashboard';
import { LoadingSkeleton } from '../../../shared/components/Card';
import { Icon } from '../../../shared/components/Icon';
import { colors, spacing, typography, radius, shadows } from '../../../shared/theme';

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function DaysChip({ days }: { days: number }) {
  const color = days < 0 ? colors.error : days <= 3 ? colors.warning : colors.textSecondary;
  const bg    = days < 0 ? colors.errorLight : days <= 3 ? colors.warningLight : colors.backgroundSecondary;
  const label = days < 0 ? 'Overdue' : days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`;
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </View>
  );
}

function AnimatedCard({ children, index }: { children: React.ReactNode; index: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1, tension: 70, friction: 12,
      delay: index * 80, useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View style={{
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
    }}>
      {children}
    </Animated.View>
  );
}

function SectionCard({ icon, iconColor, title, children, index }: {
  icon: string; iconColor: string; title: string; children: React.ReactNode; index: number;
}) {
  return (
    <AnimatedCard index={index}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconBadge, { backgroundColor: iconColor + '18' }]}>
            <Icon name={icon} size={16} color={iconColor} />
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        {children}
      </View>
    </AnimatedCard>
  );
}

export function DashboardScreen() {
  const { data, isLoading, refetch, isRefetching } = useDashboard();
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.headerBg} />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.headerSection}>
            <LoadingSkeleton width={120} height={12} style={{ borderRadius: 6, marginBottom: 8 }} />
            <LoadingSkeleton width={200} height={26} style={{ borderRadius: 8 }} />
          </View>
          {[1, 2, 3].map((i) => <LoadingSkeleton key={i} height={110} style={styles.skeletonCard} />)}
        </ScrollView>
      </View>
    );
  }

  if (!data) return null;

  const { doses, reminders, appointments, expiringDocs, expiringWarranties, vehicleAlerts } = data;
  const allClear = reminders.overdue === 0 && reminders.upcoming.length === 0 &&
    appointments.length === 0 && expiringDocs.length === 0 &&
    expiringWarranties.length === 0 && vehicleAlerts.length === 0 && doses.pending === 0;

  let cardIndex = 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerBg} />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => { void refetch(); }} tintColor={colors.white} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.headerSection, {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
        }]}>
          <Text style={styles.greetingLabel}>{greeting()} 👋</Text>
          <Text style={styles.greetingTitle}>Your Overview</Text>
        </Animated.View>

        {/* Overdue banner */}
        {reminders.overdue > 0 && (
          <AnimatedCard index={0}>
            <View style={styles.alertBanner}>
              <Icon name="alert-circle" size={18} color={colors.white} />
              <Text style={styles.alertText}>{reminders.overdue} overdue reminder{reminders.overdue > 1 ? 's' : ''}</Text>
            </View>
          </AnimatedCard>
        )}

        {/* Doses */}
        <AnimatedCard index={cardIndex++}>
          <View style={styles.dosesCard}>
            <View style={styles.dosesHeader}>
              <View style={[styles.cardIconBadge, { backgroundColor: colors.primaryGlow }]}>
                <Icon name="pill" size={16} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Today's Doses</Text>
              {doses.pending > 0 && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>{doses.pending} pending</Text>
                </View>
              )}
            </View>
            <View style={styles.doseStatsRow}>
              <DoseStat value={doses.total}   label="Total"   color={colors.text} />
              <View style={styles.doseStatDivider} />
              <DoseStat value={doses.taken}   label="Taken"   color={colors.success} />
              <View style={styles.doseStatDivider} />
              <DoseStat value={doses.pending} label="Pending" color={doses.pending > 0 ? colors.primary : colors.textDisabled} />
            </View>
            {doses.nextDose && (
              <View style={styles.nextDoseRow}>
                <Icon name="clock-outline" size={14} color={colors.primary} />
                <Text style={styles.nextDoseText} numberOfLines={1}>
                  Next: <Text style={styles.nextDoseName}>{doses.nextDose.medicineName}</Text> at {doses.nextDose.time}
                </Text>
              </View>
            )}
            {doses.total === 0 && <Text style={styles.emptyInCard}>No medicines scheduled today</Text>}
          </View>
        </AnimatedCard>

        {reminders.upcoming.length > 0 && (
          <SectionCard icon="bell-ring-outline" iconColor={colors.primary} title="Upcoming Reminders" index={cardIndex++}>
            {reminders.upcoming.map((r, i) => (
              <View key={r.id} style={[styles.listRow, i > 0 && styles.listRowBorder]}>
                <View style={styles.listRowLeft}>
                  <Text style={styles.listRowTitle} numberOfLines={1}>{r.title}</Text>
                  <Text style={styles.listRowSub} numberOfLines={1}>
                    {new Date(r.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    {' · '}
                    {new Date(r.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <DaysChip days={daysUntil(r.dueDate)} />
              </View>
            ))}
          </SectionCard>
        )}

        {appointments.length > 0 && (
          <SectionCard icon="calendar-heart" iconColor={colors.accent} title="Appointments" index={cardIndex++}>
            {appointments.map((a, i) => (
              <View key={a.id} style={[styles.listRow, i > 0 && styles.listRowBorder]}>
                <View style={[styles.apptIcon, { backgroundColor: colors.accentLight }]}>
                  <Icon name="doctor" size={16} color={colors.accent} />
                </View>
                <View style={styles.listRowLeft}>
                  <Text style={styles.listRowTitle} numberOfLines={1}>{a.doctorName}</Text>
                  <Text style={styles.listRowSub} numberOfLines={1}>
                    {new Date(a.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {a.time}
                    {a.purpose ? ` · ${a.purpose}` : ''}
                  </Text>
                </View>
                <DaysChip days={daysUntil(a.date)} />
              </View>
            ))}
          </SectionCard>
        )}

        {expiringDocs.length > 0 && (
          <SectionCard icon="file-document-outline" iconColor={colors.warning} title="Documents Expiring" index={cardIndex++}>
            {expiringDocs.map((d, i) => (
              <View key={d.id} style={[styles.listRow, i > 0 && styles.listRowBorder]}>
                <View style={styles.listRowLeft}>
                  <Text style={styles.listRowTitle} numberOfLines={1}>{d.name}</Text>
                  <Text style={styles.listRowSub} numberOfLines={1}>{d.category} · {new Date(d.expiryDate).toLocaleDateString()}</Text>
                </View>
                <DaysChip days={daysUntil(d.expiryDate)} />
              </View>
            ))}
          </SectionCard>
        )}

        {expiringWarranties.length > 0 && (
          <SectionCard icon="shield-alert-outline" iconColor={colors.warning} title="Warranties Expiring" index={cardIndex++}>
            {expiringWarranties.map((w, i) => (
              <View key={w.id} style={[styles.listRow, i > 0 && styles.listRowBorder]}>
                <View style={styles.listRowLeft}>
                  <Text style={styles.listRowTitle} numberOfLines={1}>{w.productName}</Text>
                  <Text style={styles.listRowSub} numberOfLines={1}>{new Date(w.expiryDate).toLocaleDateString()}</Text>
                </View>
                <DaysChip days={daysUntil(w.expiryDate)} />
              </View>
            ))}
          </SectionCard>
        )}

        {vehicleAlerts.length > 0 && (
          <SectionCard icon="car-wrench" iconColor={colors.info} title="Vehicle Alerts" index={cardIndex++}>
            {vehicleAlerts.flatMap((v) =>
              ([
                v.insuranceExpiry  && { label: 'Insurance', date: v.insuranceExpiry },
                v.pucExpiry        && { label: 'PUC',       date: v.pucExpiry },
                v.nextServiceDate  && { label: 'Service',   date: v.nextServiceDate },
              ] as ({ label: string; date: string } | false)[])
                .filter((a): a is { label: string; date: string } => !!a && daysUntil(a.date) <= 30)
                .map((a, i) => (
                  <View key={`${v.id}-${a.label}`} style={[styles.listRow, i > 0 && styles.listRowBorder]}>
                    <View style={styles.listRowLeft}>
                      <Text style={styles.listRowTitle} numberOfLines={1}>{v.name} — {a.label}</Text>
                      <Text style={styles.listRowSub} numberOfLines={1}>{new Date(a.date).toLocaleDateString()}</Text>
                    </View>
                    <DaysChip days={daysUntil(a.date)} />
                  </View>
                ))
            )}
          </SectionCard>
        )}

        {allClear && (
          <AnimatedCard index={1}>
            <View style={styles.allClear}>
              <View style={styles.allClearIconWrap}>
                <Icon name="check-circle-outline" size={36} color={colors.success} />
              </View>
              <Text style={styles.allClearTitle}>All clear!</Text>
              <Text style={styles.allClearSub}>Nothing needs your attention.</Text>
            </View>
          </AnimatedCard>
        )}
      </ScrollView>
    </View>
  );
}

function DoseStat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={styles.doseStat}>
      <Text style={[styles.doseStatValue, { color }]}>{value}</Text>
      <Text style={styles.doseStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerBg: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 130, backgroundColor: colors.primary,
  },
  content: { paddingTop: spacing.lg, paddingHorizontal: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },

  headerSection: { paddingTop: spacing.sm, paddingBottom: spacing.md },
  greetingLabel: { ...typography.label, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', marginBottom: spacing.xs },
  greetingTitle: { ...typography.h2, color: colors.white },

  skeletonCard: { borderRadius: radius.lg, marginBottom: spacing.sm },

  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.primaryDark, borderRadius: radius.md, padding: spacing.md,
  },
  alertText: { ...typography.body, color: colors.white, fontWeight: '600', flex: 1 },

  dosesCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, gap: spacing.md, ...shadows.md,
  },
  dosesHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pendingBadge: {
    marginLeft: 'auto', backgroundColor: colors.primaryGlow,
    paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full,
  },
  pendingBadgeText: { ...typography.label, color: colors.primary },
  doseStatsRow: {
    flexDirection: 'row', backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md, padding: spacing.md,
  },
  doseStat: { flex: 1, alignItems: 'center' },
  doseStatValue: { ...typography.h2, fontWeight: '800' },
  doseStatLabel: { ...typography.label, color: colors.textSecondary, marginTop: 2 },
  doseStatDivider: { width: 1, backgroundColor: colors.border },
  nextDoseRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.primaryGlow, borderRadius: radius.sm, padding: spacing.sm,
  },
  nextDoseText: { ...typography.bodySmall, color: colors.primary, flex: 1 },
  nextDoseName: { fontWeight: '700' },
  emptyInCard: { ...typography.bodySmall, color: colors.textDisabled, textAlign: 'center' },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, gap: spacing.sm, ...shadows.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardIconBadge: { width: 30, height: 30, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { ...typography.h3, color: colors.text, flex: 1 },

  listRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  listRowBorder: { borderTopWidth: 1, borderTopColor: colors.divider },
  listRowLeft: { flex: 1, minWidth: 0 },
  listRowTitle: { ...typography.body, color: colors.text, fontWeight: '500' },
  listRowSub: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  apptIcon: { width: 34, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },

  chip: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full },
  chipText: { ...typography.label, fontWeight: '700' },

  allClear: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  allClearIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.successLight, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  allClearTitle: { ...typography.h3, color: colors.text },
  allClearSub: { ...typography.body, color: colors.textSecondary },
});

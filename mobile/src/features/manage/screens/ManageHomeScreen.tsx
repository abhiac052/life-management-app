import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDoctors } from '../../doctors/hooks/useDoctors';
import { useAppointments } from '../../appointments/hooks/useAppointments';
import { usePrescriptions } from '../../prescriptions/hooks/usePrescriptions';
import { useMedicalReports } from '../../medical-reports/hooks/useMedicalReports';
import { useWarranties } from '../../warranties/hooks/useWarranties';
import { useVehicles } from '../../vehicles/hooks/useVehicles';
import { useReminders } from '../../reminders/hooks/useReminders';
import { Icon } from '../../../shared/components/Icon';
import { colors, spacing, typography, radius, shadows } from '../../../shared/theme';
import type { ManageStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<ManageStackParamList>;

const SECTIONS = [
  { title: 'Reminders', icon: 'bell-ring-outline', screen: 'ReminderList' as const, color: colors.primary, bg: colors.primaryGlow },
  { title: 'Doctors', icon: 'doctor', screen: 'DoctorList' as const, color: '#3B9EFF', bg: colors.infoLight },
  { title: 'Appointments', icon: 'calendar-heart', screen: 'AppointmentList' as const, color: colors.accent, bg: colors.accentLight },
  { title: 'Prescriptions', icon: 'prescription', screen: 'PrescriptionList' as const, color: colors.success, bg: colors.successLight },
  { title: 'Medical Reports', icon: 'file-chart-outline', screen: 'MedicalReportList' as const, color: colors.warning, bg: colors.warningLight },
  { title: 'Warranties', icon: 'shield-check-outline', screen: 'WarrantyList' as const, color: '#FF6584', bg: 'rgba(255,101,132,0.12)' },
  { title: 'Vehicles', icon: 'car-outline', screen: 'VehicleList' as const, color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
];

export function ManageHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { data: doctors } = useDoctors();
  const { data: appointments } = useAppointments('UPCOMING');
  const { data: prescriptions } = usePrescriptions();
  const { data: reports } = useMedicalReports();
  const { data: warranties } = useWarranties();
  const { data: vehicles } = useVehicles();
  const { data: remindersData } = useReminders('ACTIVE');

  const counts: Record<string, number> = {
    ReminderList: remindersData?.data?.length ?? 0,
    DoctorList: doctors?.length ?? 0,
    AppointmentList: appointments?.length ?? 0,
    PrescriptionList: prescriptions?.length ?? 0,
    MedicalReportList: reports?.length ?? 0,
    WarrantyList: warranties?.length ?? 0,
    VehicleList: vehicles?.length ?? 0,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>Manage</Text>
          <Text style={styles.headerTitle}>Your Records</Text>
        </View>

        <View style={styles.grid}>
          {SECTIONS.map((s) => (
            <TouchableOpacity
              key={s.screen}
              style={styles.card}
              onPress={() => navigation.navigate(s.screen)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconBox, { backgroundColor: s.bg }]}>
                <Icon name={s.icon} size={24} color={s.color} />
              </View>
              <Text style={styles.cardTitle}>{s.title}</Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.cardCount, { color: s.color }]}>{counts[s.screen]}</Text>
                <Icon name="chevron-right" size={16} color={colors.textDisabled} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.lg, paddingTop: spacing.sm },
  headerLabel: { ...typography.label, color: colors.textSecondary, textTransform: 'uppercase', marginBottom: spacing.xs },
  headerTitle: { ...typography.h2, color: colors.text },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardCount: { ...typography.h3, fontWeight: '800' },
});

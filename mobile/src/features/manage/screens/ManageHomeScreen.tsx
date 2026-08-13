import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDoctors } from '../../doctors/hooks/useDoctors';
import { useAppointments } from '../../appointments/hooks/useAppointments';
import { usePrescriptions } from '../../prescriptions/hooks/usePrescriptions';
import { useMedicalReports } from '../../medical-reports/hooks/useMedicalReports';
import { useWarranties } from '../../warranties/hooks/useWarranties';
import { useVehicles } from '../../vehicles/hooks/useVehicles';
import { useReminders } from '../../reminders/hooks/useReminders';
import { colors, spacing, typography, radius } from '../../../shared/theme';
import type { ManageStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<ManageStackParamList>;

export function ManageHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { data: doctors } = useDoctors();
  const { data: appointments } = useAppointments('UPCOMING');
  const { data: prescriptions } = usePrescriptions();
  const { data: reports } = useMedicalReports();
  const { data: warranties } = useWarranties();
  const { data: vehicles } = useVehicles();
  const { data: remindersData } = useReminders('ACTIVE');

  const sections = [
    { title: 'Reminders', icon: '🔔', count: remindersData?.data?.length ?? 0, screen: 'ReminderList' as const, color: '#4F46E5' },
    { title: 'Doctors', icon: '👨⚕️', count: doctors?.length ?? 0, screen: 'DoctorList' as const, color: '#3B82F6' },
    { title: 'Appointments', icon: '📅', count: appointments?.length ?? 0, screen: 'AppointmentList' as const, color: '#8B5CF6' },
    { title: 'Prescriptions', icon: '📋', count: prescriptions?.length ?? 0, screen: 'PrescriptionList' as const, color: '#10B981' },
    { title: 'Medical Reports', icon: '🔬', count: reports?.length ?? 0, screen: 'MedicalReportList' as const, color: '#F59E0B' },
    { title: 'Warranties', icon: '🛡️', count: warranties?.length ?? 0, screen: 'WarrantyList' as const, color: '#EF4444' },
    { title: 'Vehicles', icon: '🚗', count: vehicles?.length ?? 0, screen: 'VehicleList' as const, color: '#6366F1' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Manage</Text>
      <View style={styles.grid}>
        {sections.map((s) => (
          <TouchableOpacity
            key={s.screen}
            style={[styles.card, { borderLeftColor: s.color }]}
            onPress={() => navigation.navigate(s.screen)}
            activeOpacity={0.8}
          >
            <Text style={styles.cardIcon}>{s.icon}</Text>
            <Text style={styles.cardTitle}>{s.title}</Text>
            <Text style={[styles.cardCount, { color: s.color }]}>{s.count}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  grid: { gap: spacing.sm },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    borderLeftWidth: 4, flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  cardIcon: { fontSize: 28 },
  cardTitle: { ...typography.body, color: colors.text, fontWeight: '600', flex: 1 },
  cardCount: { ...typography.h3, fontWeight: '700' },
});

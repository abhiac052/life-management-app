import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ManageStackParamList } from './types';
import { ManageHomeScreen } from '../../features/manage/screens/ManageHomeScreen';
import { DoctorListScreen, DoctorDetailScreen, CreateDoctorScreen, EditDoctorScreen } from '../../features/doctors/screens/DoctorScreens';
import { AppointmentListScreen, AppointmentDetailScreen, CreateAppointmentScreen, EditAppointmentScreen } from '../../features/appointments/screens/AppointmentScreens';
import { PrescriptionListScreen, PrescriptionDetailScreen, CreatePrescriptionScreen } from '../../features/prescriptions/screens/PrescriptionScreens';
import { MedicalReportListScreen, MedicalReportDetailScreen, CreateMedicalReportScreen } from '../../features/medical-reports/screens/MedicalReportScreens';

const Stack = createNativeStackNavigator<ManageStackParamList>();

export default function ManageStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ManageHome" component={ManageHomeScreen} options={{ title: 'Health Records' }} />
      <Stack.Screen name="DoctorList" component={DoctorListScreen} options={{ title: 'Doctors' }} />
      <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} options={{ title: 'Doctor' }} />
      <Stack.Screen name="CreateDoctor" component={CreateDoctorScreen} options={{ title: 'Add Doctor' }} />
      <Stack.Screen name="EditDoctor" component={EditDoctorScreen} options={{ title: 'Edit Doctor' }} />
      <Stack.Screen name="AppointmentList" component={AppointmentListScreen} options={{ title: 'Appointments' }} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ title: 'Appointment' }} />
      <Stack.Screen name="CreateAppointment" component={CreateAppointmentScreen} options={{ title: 'New Appointment' }} />
      <Stack.Screen name="EditAppointment" component={EditAppointmentScreen} options={{ title: 'Edit Appointment' }} />
      <Stack.Screen name="PrescriptionList" component={PrescriptionListScreen} options={{ title: 'Prescriptions' }} />
      <Stack.Screen name="PrescriptionDetail" component={PrescriptionDetailScreen} options={{ title: 'Prescription' }} />
      <Stack.Screen name="CreatePrescription" component={CreatePrescriptionScreen} options={{ title: 'Add Prescription' }} />
      <Stack.Screen name="MedicalReportList" component={MedicalReportListScreen} options={{ title: 'Medical Reports' }} />
      <Stack.Screen name="MedicalReportDetail" component={MedicalReportDetailScreen} options={{ title: 'Report' }} />
      <Stack.Screen name="CreateMedicalReport" component={CreateMedicalReportScreen} options={{ title: 'Add Report' }} />
    </Stack.Navigator>
  );
}

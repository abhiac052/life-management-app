export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type HomeStackParamList = {
  Dashboard: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  NotificationSettings: undefined;
  HealthProfile: undefined;
  DeleteAccount: undefined;
};

export type RemindersStackParamList = {
  ReminderList: undefined;
  ReminderDetail: { id: string };
  CreateReminder: undefined;
  EditReminder: { id: string };
};

export type VaultStackParamList = {
  VaultHome: undefined;
  DocumentDetail: { id: string };
  CreateDocument: undefined;
  EditDocument: { id: string };
};

export type MedicinesStackParamList = {
  TodayDoses: undefined;
  MedicineList: undefined;
  MedicineDetail: { id: string };
  CreateMedicine: undefined;
  EditMedicine: { id: string };
};

export type ManageStackParamList = {
  ManageHome: undefined;
  ReminderList: undefined;
  ReminderDetail: { id: string };
  CreateReminder: undefined;
  EditReminder: { id: string };
  DoctorList: undefined;
  DoctorDetail: { id: string };
  CreateDoctor: undefined;
  EditDoctor: { id: string };
  AppointmentList: undefined;
  AppointmentDetail: { id: string };
  CreateAppointment: undefined;
  EditAppointment: { id: string };
  PrescriptionList: undefined;
  PrescriptionDetail: { id: string };
  CreatePrescription: undefined;
  MedicalReportList: undefined;
  MedicalReportDetail: { id: string };
  CreateMedicalReport: undefined;
  WarrantyList: undefined;
  WarrantyDetail: { id: string };
  CreateWarranty: undefined;
  EditWarranty: { id: string };
  VehicleList: undefined;
  VehicleDetail: { id: string };
  CreateVehicle: undefined;
  EditVehicle: { id: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  HealthTab: undefined;
  VaultTab: undefined;
  ManageTab: undefined;
  ProfileTab: undefined;
};

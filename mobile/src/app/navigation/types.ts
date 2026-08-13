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
  DeleteAccount: undefined;
};

export type RemindersStackParamList = {
  ReminderList: undefined;
  ReminderDetail: { id: string };
  CreateReminder: undefined;
  EditReminder: { id: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  HealthTab: undefined;
  VaultTab: undefined;
  ManageTab: undefined;
  ProfileTab: undefined;
};

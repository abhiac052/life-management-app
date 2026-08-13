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

export type MainTabParamList = {
  HomeTab: undefined;
  HealthTab: undefined;
  VaultTab: undefined;
  ManageTab: undefined;
  ProfileTab: undefined;
};

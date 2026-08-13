import { registerAs } from '@nestjs/config';

export default registerAs('notification', () => ({
  fcmProjectId: process.env.FCM_PROJECT_ID ?? '',
  fcmPrivateKey: (process.env.FCM_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
  fcmClientEmail: process.env.FCM_CLIENT_EMAIL ?? '',
}));

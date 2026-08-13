import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  provider: process.env.STORAGE_PROVIDER ?? 'local',
  localPath: process.env.STORAGE_LOCAL_PATH ?? './uploads',
}));

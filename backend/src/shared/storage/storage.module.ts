import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService, LocalStorageService } from './storage.service';

@Module({
  providers: [
    {
      provide: StorageService,
      useFactory: (config: ConfigService) => new LocalStorageService(config),
      inject: [ConfigService],
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}

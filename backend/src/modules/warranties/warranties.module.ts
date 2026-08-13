import { Module } from '@nestjs/common';
import { WarrantiesService } from './warranties.service';
import { WarrantiesController } from './warranties.controller';
import { RemindersModule } from '../reminders/reminders.module';
import { StorageModule } from '../../shared/storage/storage.module';

@Module({
  imports: [StorageModule, RemindersModule],
  controllers: [WarrantiesController],
  providers: [WarrantiesService],
  exports: [WarrantiesService],
})
export class WarrantiesModule {}

import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { StorageModule } from '../../shared/storage/storage.module';
import { RemindersModule } from '../reminders/reminders.module';

@Module({
  imports: [StorageModule, RemindersModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}

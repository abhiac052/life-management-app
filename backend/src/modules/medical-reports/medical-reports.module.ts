import { Module } from '@nestjs/common';
import { MedicalReportsService } from './medical-reports.service';
import { MedicalReportsController } from './medical-reports.controller';
import { StorageModule } from '../../shared/storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [MedicalReportsController],
  providers: [MedicalReportsService],
})
export class MedicalReportsModule {}

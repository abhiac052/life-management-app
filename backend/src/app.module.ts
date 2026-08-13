import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import storageConfig from './config/storage.config';
import emailConfig from './config/email.config';
import notificationConfig from './config/notification.config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { PrismaModule } from './shared/prisma/prisma.module';
import { StorageModule } from './shared/storage/storage.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { MedicinesModule } from './modules/medicines/medicines.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { MedicalReportsModule } from './modules/medical-reports/medical-reports.module';
import { WarrantiesModule } from './modules/warranties/warranties.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthProfileModule } from './modules/health-profile/health-profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, databaseConfig, storageConfig, emailConfig, notificationConfig],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    StorageModule,
    AuthModule,
    ProfileModule,
    NotificationsModule,
    RemindersModule,
    DocumentsModule,
    MedicinesModule,
    DoctorsModule,
    AppointmentsModule,
    PrescriptionsModule,
    MedicalReportsModule,
    WarrantiesModule,
    VehiclesModule,
    DashboardModule,
    HealthProfileModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}

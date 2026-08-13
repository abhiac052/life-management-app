import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationSenderService } from './notification-sender.service';
import { DevicesController } from './devices.controller';

@Module({
  controllers: [NotificationsController, DevicesController],
  providers: [NotificationsService, NotificationSenderService],
  exports: [NotificationsService, NotificationSenderService],
})
export class NotificationsModule {}

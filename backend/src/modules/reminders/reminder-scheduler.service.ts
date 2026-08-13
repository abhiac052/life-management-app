import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RemindersService } from './reminders.service';
import { NotificationSenderService } from '../notifications/notification-sender.service';

@Injectable()
export class ReminderSchedulerService {
  private readonly logger = new Logger(ReminderSchedulerService.name);

  constructor(
    private readonly remindersService: RemindersService,
    private readonly notificationSender: NotificationSenderService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async processReminders() {
    const now = new Date();
    try {
      const due = await this.remindersService.getDueReminders(now);
      for (const reminder of due) {
        await this.notificationSender.sendToUser(reminder.userId, {
          title: reminder.title,
          body: reminder.description ?? 'You have a reminder due',
          type: 'reminder',
          data: {
            entityType: 'reminder',
            entityId: reminder.id,
            screen: 'ReminderDetail',
          },
        });
        // Advance recurring or expire one-time after notifying
        // (action is taken by user — we just notify here, not auto-complete)
      }
      if (due.length) this.logger.log(`Processed ${due.length} due reminders`);
    } catch (err) {
      this.logger.error('Error processing reminders', err);
    }
  }
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import type { MulticastMessage } from 'firebase-admin/messaging';
import { PrismaService } from '../../shared/prisma/prisma.service';

export interface NotificationPayload {
  title: string;
  body: string;
  type: string;
  data?: Record<string, string>;
}

@Injectable()
export class NotificationSenderService implements OnModuleInit {
  private readonly logger = new Logger(NotificationSenderService.name);
  private initialized = false;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    const projectId = this.config.get<string>('notification.fcmProjectId');
    const privateKey = this.config.get<string>('notification.fcmPrivateKey');
    const clientEmail = this.config.get<string>('notification.fcmClientEmail');

    const isPlaceholder = (v: string | undefined) => !v || v.startsWith('your-');
    if (isPlaceholder(projectId) || isPlaceholder(clientEmail) || isPlaceholder(privateKey)) {
      this.logger.warn('FCM not configured — push notifications disabled');
      return;
    }

    if (!getApps().length) {
      initializeApp({ credential: cert({ projectId, privateKey, clientEmail }) });
    }
    this.initialized = true;
  }

  async sendToUser(userId: string, payload: NotificationPayload): Promise<void> {
    // Store notification record regardless of FCM status
    await this.prisma.notification.create({
      data: {
        userId,
        title: payload.title,
        body: payload.body,
        type: payload.type,
        data: payload.data ?? {},
      },
    });

    if (!this.initialized) return;

    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId, isActive: true },
      select: { token: true },
    });

    if (!tokens.length) return;

    const message: MulticastMessage = {
      tokens: tokens.map(t => t.token),
      notification: { title: payload.title, body: payload.body },
      data: payload.data ?? {},
    };

    try {
      const result = await getMessaging().sendEachForMulticast(message);
      // Deactivate invalid tokens
      result.responses.forEach((resp, i) => {
        if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
          void this.prisma.deviceToken.updateMany({
            where: { token: tokens[i].token },
            data: { isActive: false },
          });
        }
      });
    } catch (err) {
      this.logger.error(`FCM send failed for user ${userId}`, err);
    }
  }
}

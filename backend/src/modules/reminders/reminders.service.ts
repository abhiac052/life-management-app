import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LinkedEntityType, RecurrenceType, ReminderStatus } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateReminderDto, SnoozeReminderDto, UpdateReminderDto } from './dto/reminder.dto';

@Injectable()
export class RemindersService {
  constructor(private readonly prisma: PrismaService) {}

  // ── CRUD ─────────────────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateReminderDto) {
    const dueDate = new Date(dto.dueDate);
    if (dueDate <= new Date()) throw new BadRequestException('dueDate must be in the future');

    return this.prisma.reminder.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        startDate: new Date(dto.startDate),
        dueDate,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        recurrenceType: dto.recurrenceType ?? RecurrenceType.ONCE,
        recurrenceRule: dto.recurrenceRule ? (dto.recurrenceRule as object) : undefined,
        notifyBefore: dto.notifyBefore ?? [0],
      },
    });
  }

  async findAll(userId: string, status?: string, page = 1, limit = 20) {
    const where = {
      userId,
      ...(status ? { status: status as ReminderStatus } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.reminder.findMany({
        where,
        orderBy: { dueDate: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.reminder.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(userId: string, id: string) {
    const reminder = await this.prisma.reminder.findUnique({ where: { id } });
    if (!reminder) throw new NotFoundException('Reminder not found');
    if (reminder.userId !== userId) throw new ForbiddenException();
    return reminder;
  }

  async update(userId: string, id: string, dto: UpdateReminderDto) {
    await this.findOne(userId, id);
    return this.prisma.reminder.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        recurrenceType: dto.recurrenceType,
        recurrenceRule: dto.recurrenceRule ? (dto.recurrenceRule as object) : undefined,
        notifyBefore: dto.notifyBefore,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.reminder.delete({ where: { id } });
    return { message: 'Reminder deleted' };
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  async complete(userId: string, id: string) {
    const reminder = await this.findOne(userId, id);

    await this.prisma.reminderAction.create({
      data: { reminderId: id, action: 'completed' },
    });

    if (reminder.recurrenceType === RecurrenceType.ONCE) {
      return this.prisma.reminder.update({ where: { id }, data: { status: ReminderStatus.EXPIRED } });
    }

    return this.advanceToNextOccurrence(reminder);
  }

  async skip(userId: string, id: string) {
    const reminder = await this.findOne(userId, id);

    await this.prisma.reminderAction.create({
      data: { reminderId: id, action: 'skipped' },
    });

    if (reminder.recurrenceType === RecurrenceType.ONCE) {
      return this.prisma.reminder.update({ where: { id }, data: { status: ReminderStatus.EXPIRED } });
    }

    return this.advanceToNextOccurrence(reminder);
  }

  async snooze(userId: string, id: string, dto: SnoozeReminderDto) {
    const reminder = await this.findOne(userId, id);
    const snoozedUntil = new Date(Date.now() + dto.duration * 60 * 1000);

    await this.prisma.reminderAction.create({
      data: { reminderId: id, action: 'snoozed', snoozedTo: snoozedUntil },
    });

    return this.prisma.reminder.update({
      where: { id },
      data: { snoozedUntil, status: ReminderStatus.ACTIVE },
    });
  }

  async pause(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.reminder.update({ where: { id }, data: { status: ReminderStatus.PAUSED } });
  }

  async resume(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.reminder.update({ where: { id }, data: { status: ReminderStatus.ACTIVE } });
  }

  async getHistory(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.reminderAction.findMany({
      where: { reminderId: id },
      orderBy: { performedAt: 'desc' },
    });
  }

  // ── System (used by other modules) ───────────────────────────────────────────

  async createSystemReminder(data: {
    userId: string;
    title: string;
    dueDate: Date;
    linkedEntityType: LinkedEntityType;
    linkedEntityId: string;
    recurrenceType?: RecurrenceType;
    notifyBefore?: number[];
  }) {
    return this.prisma.reminder.create({
      data: {
        userId: data.userId,
        title: data.title,
        startDate: data.dueDate,
        dueDate: data.dueDate,
        recurrenceType: data.recurrenceType ?? RecurrenceType.ONCE,
        notifyBefore: data.notifyBefore ?? [0],
        linkedEntityType: data.linkedEntityType,
        linkedEntityId: data.linkedEntityId,
        isSystemGenerated: true,
      },
    });
  }

  async deleteLinkedReminders(entityType: LinkedEntityType, entityId: string) {
    await this.prisma.reminder.deleteMany({
      where: { linkedEntityType: entityType, linkedEntityId: entityId },
    });
  }

  // ── Due reminders for cron ────────────────────────────────────────────────────

  async getDueReminders(now: Date) {
    return this.prisma.reminder.findMany({
      where: {
        status: ReminderStatus.ACTIVE,
        dueDate: { lte: now },
        OR: [{ snoozedUntil: null }, { snoozedUntil: { lte: now } }],
      },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  // ── Recurrence calculation ────────────────────────────────────────────────────

  private async advanceToNextOccurrence(reminder: { id: string; dueDate: Date; recurrenceType: RecurrenceType; recurrenceRule: unknown; endDate: Date | null }) {
    const next = this.calculateNextOccurrence(reminder.dueDate, reminder.recurrenceType, reminder.recurrenceRule as Record<string, unknown> | null);

    if (!next || (reminder.endDate && next > reminder.endDate)) {
      return this.prisma.reminder.update({ where: { id: reminder.id }, data: { status: ReminderStatus.EXPIRED } });
    }

    return this.prisma.reminder.update({
      where: { id: reminder.id },
      data: { dueDate: next, snoozedUntil: null, status: ReminderStatus.ACTIVE },
    });
  }

  private calculateNextOccurrence(
    current: Date,
    type: RecurrenceType,
    rule: Record<string, unknown> | null,
  ): Date | null {
    const d = new Date(current);

    switch (type) {
      case RecurrenceType.DAILY:
        d.setDate(d.getDate() + 1);
        return d;

      case RecurrenceType.WEEKLY: {
        const days = (rule?.daysOfWeek as number[]) ?? [];
        if (!days.length) { d.setDate(d.getDate() + 7); return d; }
        // Find next matching day of week
        for (let i = 1; i <= 7; i++) {
          const next = new Date(d);
          next.setDate(d.getDate() + i);
          const dow = next.getDay() === 0 ? 7 : next.getDay(); // ISO: 1=Mon, 7=Sun
          if (days.includes(dow)) return next;
        }
        return null;
      }

      case RecurrenceType.MONTHLY: {
        const dom = (rule?.dayOfMonth as number) ?? d.getDate();
        d.setMonth(d.getMonth() + 1);
        d.setDate(dom);
        return d;
      }

      case RecurrenceType.YEARLY: {
        d.setFullYear(d.getFullYear() + 1);
        return d;
      }

      case RecurrenceType.CUSTOM: {
        const interval = (rule?.interval as number) ?? 1;
        const unit = (rule?.unit as string) ?? 'days';
        if (unit === 'days') d.setDate(d.getDate() + interval);
        else if (unit === 'weeks') d.setDate(d.getDate() + interval * 7);
        else if (unit === 'months') d.setMonth(d.getMonth() + interval);
        return d;
      }

      default:
        return null;
    }
  }
}

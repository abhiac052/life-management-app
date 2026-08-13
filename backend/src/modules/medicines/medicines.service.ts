import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LinkedEntityType, RecurrenceType } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RemindersService } from '../reminders/reminders.service';
import {
  CreateMedicineDto,
  LogDoseDto,
  UpdateMedicineDto,
  UpdateStockDto,
} from './dto/medicine.dto';

@Injectable()
export class MedicinesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reminders: RemindersService,
  ) {}

  // ── CRUD ─────────────────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateMedicineDto) {
    const medicine = await this.prisma.medicine.create({
      data: {
        userId,
        name: dto.name,
        dosage: dto.dosage,
        form: dto.form,
        mealRelation: dto.mealRelation,
        instructions: dto.instructions,
        notes: dto.notes,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        prescriptionId: dto.prescriptionId,
        schedules: dto.schedules?.length
          ? {
              create: dto.schedules.map((s) => ({
                time: s.time,
                label: s.label,
                daysOfWeek: s.daysOfWeek,
              })),
            }
          : undefined,
        stock:
          dto.stockQty !== undefined
            ? {
                create: {
                  currentQty: dto.stockQty,
                  unitsPerDose: dto.unitsPerDose ?? 1,
                  dosesPerDay: dto.dosesPerDay ?? 1,
                  refillThreshold: dto.refillThreshold ?? 7,
                },
              }
            : undefined,
      },
      include: { schedules: true, stock: true },
    });

    // Auto-create refill reminder if stock is below threshold
    if (medicine.stock && medicine.stock.currentQty <= medicine.stock.refillThreshold) {
      await this.createRefillReminder(userId, medicine.id, medicine.name);
    }

    return medicine;
  }

  async findAll(userId: string, isActive?: boolean) {
    return this.prisma.medicine.findMany({
      where: {
        userId,
        ...(isActive !== undefined ? { isActive } : {}),
      },
      include: { schedules: { where: { isActive: true } }, stock: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const medicine = await this.prisma.medicine.findUnique({
      where: { id },
      include: { schedules: true, stock: true },
    });
    if (!medicine) throw new NotFoundException('Medicine not found');
    if (medicine.userId !== userId) throw new ForbiddenException();
    return medicine;
  }

  async update(userId: string, id: string, dto: UpdateMedicineDto) {
    await this.findOne(userId, id);
    return this.prisma.medicine.update({
      where: { id },
      data: {
        name: dto.name,
        dosage: dto.dosage,
        form: dto.form,
        mealRelation: dto.mealRelation,
        instructions: dto.instructions,
        notes: dto.notes,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        prescriptionId: dto.prescriptionId,
        isActive: dto.endDate ? new Date(dto.endDate) > new Date() : undefined,
      },
      include: { schedules: true, stock: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.reminders.deleteLinkedReminders(LinkedEntityType.MEDICINE, id);
    await this.prisma.medicine.delete({ where: { id } });
    return { message: 'Medicine deleted' };
  }

  async deactivate(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.medicine.update({ where: { id }, data: { isActive: false } });
  }

  // ── Schedules ─────────────────────────────────────────────────────────────────

  async addSchedule(userId: string, medicineId: string, dto: { time: string; label?: string; daysOfWeek: number[] }) {
    await this.findOne(userId, medicineId);
    return this.prisma.medicineSchedule.create({
      data: { medicineId, time: dto.time, label: dto.label, daysOfWeek: dto.daysOfWeek },
    });
  }

  async removeSchedule(userId: string, medicineId: string, scheduleId: string) {
    await this.findOne(userId, medicineId);
    await this.prisma.medicineSchedule.delete({ where: { id: scheduleId } });
    return { message: 'Schedule removed' };
  }

  // ── Today's doses ─────────────────────────────────────────────────────────────

  async getToday(userId: string, timezone: string) {
    const now = new Date();
    const todayStr = this.toLocalDateString(now, timezone);
    const todayDow = this.getLocalDayOfWeek(now, timezone); // 1=Mon..7=Sun

    // Start/end of today in UTC
    const startOfDay = new Date(`${todayStr}T00:00:00`);
    const endOfDay = new Date(`${todayStr}T23:59:59`);
    // Adjust for timezone offset
    const tzOffset = this.getTzOffsetMs(timezone);
    const startUtc = new Date(startOfDay.getTime() - tzOffset);
    const endUtc = new Date(endOfDay.getTime() - tzOffset);

    const medicines = await this.prisma.medicine.findMany({
      where: { userId, isActive: true },
      include: {
        schedules: {
          where: {
            isActive: true,
            OR: [
              { daysOfWeek: { isEmpty: true } },
              { daysOfWeek: { has: todayDow } },
            ],
          },
        },
        stock: true,
      },
    });

    // Fetch today's dose logs for this user
    const doseLogs = await this.prisma.medicineDose.findMany({
      where: {
        userId,
        scheduledAt: { gte: startUtc, lte: endUtc },
      },
    });

    const doseMap = new Map(doseLogs.map((d) => [`${d.scheduleId}:${d.scheduledAt.toISOString()}`, d]));

    const result = medicines.flatMap((med) =>
      med.schedules.map((schedule) => {
        const scheduledAt = this.buildScheduledAt(todayStr, schedule.time, timezone);
        const key = `${schedule.id}:${scheduledAt.toISOString()}`;
        const log = doseMap.get(key);
        return {
          medicineId: med.id,
          medicineName: med.name,
          dosage: med.dosage,
          form: med.form,
          mealRelation: med.mealRelation,
          scheduleId: schedule.id,
          scheduleTime: schedule.time,
          scheduleLabel: schedule.label,
          scheduledAt,
          status: log?.action ?? 'pending',
          logId: log?.id ?? null,
          stock: med.stock,
        };
      }),
    );

    // Sort by schedule time
    result.sort((a, b) => a.scheduleTime.localeCompare(b.scheduleTime));
    return result;
  }

  // ── Dose logging ──────────────────────────────────────────────────────────────

  async logDose(userId: string, dto: LogDoseDto) {
    if (!['taken', 'skipped'].includes(dto.action)) {
      throw new BadRequestException('action must be taken or skipped');
    }

    const schedule = await this.prisma.medicineSchedule.findUnique({
      where: { id: dto.scheduleId },
      include: { medicine: true },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    if (schedule.medicine.userId !== userId) throw new ForbiddenException();

    const scheduledAt = new Date(dto.scheduledAt);

    // Upsert: one log per schedule+scheduledAt
    const existing = await this.prisma.medicineDose.findFirst({
      where: { scheduleId: dto.scheduleId, scheduledAt },
    });

    const dose = existing
      ? await this.prisma.medicineDose.update({
          where: { id: existing.id },
          data: { action: dto.action, actionAt: new Date(), note: dto.note },
        })
      : await this.prisma.medicineDose.create({
          data: {
            scheduleId: dto.scheduleId,
            userId,
            scheduledAt,
            action: dto.action,
            actionAt: new Date(),
            note: dto.note,
          },
        });

    // Deduct stock on 'taken'
    if (dto.action === 'taken') {
      await this.deductStock(schedule.medicine.id, userId, schedule.medicine.name);
    }

    return dose;
  }

  // ── Adherence ─────────────────────────────────────────────────────────────────

  async getAdherence(userId: string, medicineId: string, from?: string, to?: string) {
    await this.findOne(userId, medicineId);

    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();

    const schedules = await this.prisma.medicineSchedule.findMany({
      where: { medicineId },
      select: { id: true },
    });
    const scheduleIds = schedules.map((s) => s.id);

    const doses = await this.prisma.medicineDose.findMany({
      where: {
        scheduleId: { in: scheduleIds },
        scheduledAt: { gte: fromDate, lte: toDate },
      },
    });

    const total = doses.length;
    const taken = doses.filter((d) => d.action === 'taken').length;
    const skipped = doses.filter((d) => d.action === 'skipped').length;
    const missed = doses.filter((d) => d.action === 'missed').length;

    return {
      medicineId,
      from: fromDate,
      to: toDate,
      total,
      taken,
      skipped,
      missed,
      adherencePercent: total > 0 ? Math.round((taken / total) * 100) : null,
    };
  }

  // ── Stock ─────────────────────────────────────────────────────────────────────

  async upsertStock(userId: string, medicineId: string, dto: UpdateStockDto) {
    await this.findOne(userId, medicineId);

    const stock = await this.prisma.medicineStock.upsert({
      where: { medicineId },
      create: {
        medicineId,
        currentQty: dto.currentQty,
        unitsPerDose: dto.unitsPerDose ?? 1,
        dosesPerDay: dto.dosesPerDay ?? 1,
        refillThreshold: dto.refillThreshold ?? 7,
        lastUpdated: new Date(),
      },
      update: {
        currentQty: dto.currentQty,
        unitsPerDose: dto.unitsPerDose,
        dosesPerDay: dto.dosesPerDay,
        refillThreshold: dto.refillThreshold,
        lastUpdated: new Date(),
      },
    });

    const medicine = await this.prisma.medicine.findUnique({ where: { id: medicineId }, select: { name: true } });

    // Delete existing refill reminder then re-evaluate
    await this.reminders.deleteLinkedReminders(LinkedEntityType.MEDICINE, medicineId);
    if (stock.currentQty <= stock.refillThreshold) {
      await this.createRefillReminder(userId, medicineId, medicine!.name);
    }

    return stock;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  private async deductStock(medicineId: string, userId: string, medicineName: string) {
    const stock = await this.prisma.medicineStock.findUnique({ where: { medicineId } });
    if (!stock) return;

    const newQty = Math.max(0, stock.currentQty - stock.unitsPerDose);
    await this.prisma.medicineStock.update({
      where: { medicineId },
      data: { currentQty: newQty, lastUpdated: new Date() },
    });

    // Create refill reminder when crossing threshold
    if (stock.currentQty > stock.refillThreshold && newQty <= stock.refillThreshold) {
      await this.createRefillReminder(userId, medicineId, medicineName);
    }
  }

  private async createRefillReminder(userId: string, medicineId: string, medicineName: string) {
    const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // tomorrow
    await this.reminders.createSystemReminder({
      userId,
      title: `Refill ${medicineName}`,
      dueDate,
      linkedEntityType: LinkedEntityType.MEDICINE,
      linkedEntityId: medicineId,
      notifyBefore: [0, 60],
    });
  }

  private toLocalDateString(date: Date, timezone: string): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(date); // YYYY-MM-DD
  }

  private getLocalDayOfWeek(date: Date, timezone: string): number {
    const dayName = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'long' }).format(date);
    const map: Record<string, number> = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7 };
    return map[dayName] ?? 1;
  }

  private getTzOffsetMs(timezone: string): number {
    const now = new Date();
    const utcStr = now.toLocaleString('en-US', { timeZone: 'UTC' });
    const tzStr = now.toLocaleString('en-US', { timeZone: timezone });
    return new Date(tzStr).getTime() - new Date(utcStr).getTime();
  }

  private buildScheduledAt(dateStr: string, time: string, timezone: string): Date {
    // Build a Date for dateStr + time in the given timezone
    const localStr = `${dateStr}T${time}:00`;
    const tzOffset = this.getTzOffsetMs(timezone);
    return new Date(new Date(localStr).getTime() - tzOffset);
  }
}

import { Injectable } from '@nestjs/common';
import { ReminderStatus } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string, timezone: string) {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const todayStr = this.toLocalDateString(now, timezone);
    const todayDow = this.getLocalDayOfWeek(now, timezone);

    const [
      upcomingReminders,
      overdueReminders,
      todayMedicines,
      todayDoseLogs,
      expiringDocs,
      expiringWarranties,
      vehicleDates,
      upcomingAppointments,
    ] = await Promise.all([
      // Next 5 upcoming reminders
      this.prisma.reminder.findMany({
        where: {
          userId,
          status: ReminderStatus.ACTIVE,
          dueDate: { gte: now, lte: in30Days },
          OR: [{ snoozedUntil: null }, { snoozedUntil: { lte: now } }],
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
        select: { id: true, title: true, dueDate: true, category: true, linkedEntityType: true },
      }),

      // Overdue reminders count
      this.prisma.reminder.count({
        where: {
          userId,
          status: ReminderStatus.ACTIVE,
          dueDate: { lt: now },
          OR: [{ snoozedUntil: null }, { snoozedUntil: { lte: now } }],
        },
      }),

      // Today's active medicine schedules
      this.prisma.medicine.findMany({
        where: { userId, isActive: true },
        include: {
          schedules: {
            where: {
              isActive: true,
              OR: [{ daysOfWeek: { isEmpty: true } }, { daysOfWeek: { has: todayDow } }],
            },
          },
        },
      }),

      // Today's dose logs
      this.prisma.medicineDose.findMany({
        where: {
          userId,
          scheduledAt: {
            gte: new Date(`${todayStr}T00:00:00Z`),
            lte: new Date(`${todayStr}T23:59:59Z`),
          },
        },
        select: { scheduleId: true, action: true },
      }),

      // Documents expiring in 30 days
      this.prisma.document.findMany({
        where: {
          userId,
          deletedAt: null,
          expiryDate: { gte: now, lte: in30Days },
        },
        orderBy: { expiryDate: 'asc' },
        take: 5,
        select: { id: true, name: true, category: true, expiryDate: true },
      }),

      // Warranties expiring in 30 days
      this.prisma.warranty.findMany({
        where: {
          userId,
          expiryDate: { gte: now, lte: in30Days },
        },
        orderBy: { expiryDate: 'asc' },
        take: 5,
        select: { id: true, productName: true, expiryDate: true },
      }),

      // Vehicles with dates in next 30 days
      this.prisma.vehicle.findMany({
        where: {
          userId,
          OR: [
            { insuranceExpiry: { gte: now, lte: in30Days } },
            { pucExpiry: { gte: now, lte: in30Days } },
            { nextServiceDate: { gte: now, lte: in30Days } },
          ],
        },
        select: { id: true, name: true, type: true, insuranceExpiry: true, pucExpiry: true, nextServiceDate: true },
      }),

      // Upcoming appointments in next 30 days
      this.prisma.appointment.findMany({
        where: {
          userId,
          status: 'UPCOMING',
          date: { gte: now, lte: in30Days },
        },
        orderBy: { date: 'asc' },
        take: 3,
        select: { id: true, doctorName: true, date: true, time: true, purpose: true },
      }),
    ]);

    // Calculate today's dose summary
    const loggedScheduleIds = new Set(todayDoseLogs.map((d) => d.scheduleId));
    const totalDosesToday = todayMedicines.reduce((sum, m) => sum + m.schedules.length, 0);
    const takenToday = todayDoseLogs.filter((d) => d.action === 'taken').length;
    const pendingToday = totalDosesToday - loggedScheduleIds.size;

    // Next dose time
    const now_time = this.toLocalTimeString(now, timezone);
    const pendingDoses = todayMedicines
      .flatMap((m) => m.schedules.map((s) => ({ ...s, medicineName: m.name })))
      .filter((s) => !loggedScheduleIds.has(s.id) && s.time >= now_time)
      .sort((a, b) => a.time.localeCompare(b.time));

    return {
      doses: {
        total: totalDosesToday,
        taken: takenToday,
        pending: Math.max(0, pendingToday),
        nextDose: pendingDoses[0] ?? null,
      },
      reminders: {
        overdue: overdueReminders,
        upcoming: upcomingReminders,
      },
      appointments: upcomingAppointments,
      expiringDocs,
      expiringWarranties,
      vehicleAlerts: vehicleDates,
    };
  }

  private toLocalDateString(date: Date, timezone: string): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(date);
  }

  private toLocalTimeString(date: Date, timezone: string): string {
    return new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
  }

  private getLocalDayOfWeek(date: Date, timezone: string): number {
    const dayName = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'long' }).format(date);
    const map: Record<string, number> = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7 };
    return map[dayName] ?? 1;
  }
}

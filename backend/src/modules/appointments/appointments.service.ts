import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, LinkedEntityType, RecurrenceType } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RemindersService } from '../reminders/reminders.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reminders: RemindersService,
  ) {}

  async create(userId: string, dto: CreateAppointmentDto) {
    const appointment = await this.prisma.appointment.create({
      data: {
        userId,
        doctorId: dto.doctorId,
        doctorName: dto.doctorName,
        date: new Date(dto.date),
        time: dto.time,
        purpose: dto.purpose,
        notes: dto.notes,
        prescriptionId: dto.prescriptionId,
      },
      include: { doctor: true },
    });

    await this.createAppointmentReminder(userId, appointment.id, dto.doctorName, dto.date, dto.time);
    return appointment;
  }

  async findAll(userId: string, status?: AppointmentStatus) {
    return this.prisma.appointment.findMany({
      where: { userId, ...(status ? { status } : {}) },
      include: { doctor: { select: { id: true, name: true, specialization: true } } },
      orderBy: { date: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id },
      include: { doctor: true, prescription: true },
    });
    if (!appt) throw new NotFoundException('Appointment not found');
    if (appt.userId !== userId) throw new ForbiddenException();
    return appt;
  }

  async update(userId: string, id: string, dto: UpdateAppointmentDto) {
    await this.findOne(userId, id);
    const appt = await this.prisma.appointment.update({
      where: { id },
      data: {
        doctorId: dto.doctorId,
        doctorName: dto.doctorName,
        date: dto.date ? new Date(dto.date) : undefined,
        time: dto.time,
        purpose: dto.purpose,
        notes: dto.notes,
        status: dto.status,
        prescriptionId: dto.prescriptionId,
      },
    });

    // Recreate reminder if date/time changed
    if (dto.date || dto.time) {
      await this.reminders.deleteLinkedReminders(LinkedEntityType.APPOINTMENT, id);
      if (appt.status === AppointmentStatus.UPCOMING) {
        await this.createAppointmentReminder(userId, id, appt.doctorName, appt.date.toISOString(), appt.time);
      }
    }

    return appt;
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.reminders.deleteLinkedReminders(LinkedEntityType.APPOINTMENT, id);
    await this.prisma.appointment.delete({ where: { id } });
    return { message: 'Appointment deleted' };
  }

  private async createAppointmentReminder(
    userId: string, appointmentId: string, doctorName: string, date: string, time: string,
  ) {
    const dueDate = new Date(`${date.split('T')[0]}T${time}:00`);
    if (dueDate <= new Date()) return;
    await this.reminders.createSystemReminder({
      userId,
      title: `Appointment with ${doctorName}`,
      dueDate,
      linkedEntityType: LinkedEntityType.APPOINTMENT,
      linkedEntityId: appointmentId,
      recurrenceType: RecurrenceType.ONCE,
      notifyBefore: [60, 1440], // 1 hour and 1 day before
    });
  }
}

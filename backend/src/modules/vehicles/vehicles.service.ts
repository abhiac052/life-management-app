import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { LinkedEntityType, RecurrenceType } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RemindersService } from '../reminders/reminders.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reminders: RemindersService,
  ) {}

  async create(userId: string, dto: CreateVehicleDto) {
    const vehicle = await this.prisma.vehicle.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        registrationNo: dto.registrationNo,
        insuranceExpiry: dto.insuranceExpiry ? new Date(dto.insuranceExpiry) : undefined,
        pucExpiry: dto.pucExpiry ? new Date(dto.pucExpiry) : undefined,
        nextServiceDate: dto.nextServiceDate ? new Date(dto.nextServiceDate) : undefined,
        notes: dto.notes,
      },
    });

    await this.createVehicleReminders(userId, vehicle.id, vehicle.name, dto);
    return vehicle;
  }

  findAll(userId: string) {
    return this.prisma.vehicle.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(userId: string, id: string) {
    const v = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!v) throw new NotFoundException('Vehicle not found');
    if (v.userId !== userId) throw new ForbiddenException();
    return v;
  }

  async update(userId: string, id: string, dto: UpdateVehicleDto) {
    await this.findOne(userId, id);
    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type,
        registrationNo: dto.registrationNo,
        insuranceExpiry: dto.insuranceExpiry ? new Date(dto.insuranceExpiry) : undefined,
        pucExpiry: dto.pucExpiry ? new Date(dto.pucExpiry) : undefined,
        nextServiceDate: dto.nextServiceDate ? new Date(dto.nextServiceDate) : undefined,
        notes: dto.notes,
      },
    });

    // Recreate reminders if dates changed
    if (dto.insuranceExpiry || dto.pucExpiry || dto.nextServiceDate) {
      await this.reminders.deleteLinkedReminders(LinkedEntityType.VEHICLE, id);
      await this.createVehicleReminders(userId, id, vehicle.name, dto);
    }

    return vehicle;
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.reminders.deleteLinkedReminders(LinkedEntityType.VEHICLE, id);
    await this.prisma.vehicle.delete({ where: { id } });
    return { message: 'Vehicle deleted' };
  }

  private async createVehicleReminders(
    userId: string,
    vehicleId: string,
    vehicleName: string,
    dto: Pick<CreateVehicleDto, 'insuranceExpiry' | 'pucExpiry' | 'nextServiceDate'>,
  ) {
    const tasks: Promise<unknown>[] = [];

    if (dto.insuranceExpiry) {
      const d = this.reminderDate(dto.insuranceExpiry, 30);
      if (d) tasks.push(this.reminders.createSystemReminder({
        userId, title: `${vehicleName} insurance expires soon`,
        dueDate: d, linkedEntityType: LinkedEntityType.VEHICLE, linkedEntityId: vehicleId,
        recurrenceType: RecurrenceType.ONCE, notifyBefore: [0],
      }));
    }

    if (dto.pucExpiry) {
      const d = this.reminderDate(dto.pucExpiry, 15);
      if (d) tasks.push(this.reminders.createSystemReminder({
        userId, title: `${vehicleName} PUC expires soon`,
        dueDate: d, linkedEntityType: LinkedEntityType.VEHICLE, linkedEntityId: vehicleId,
        recurrenceType: RecurrenceType.ONCE, notifyBefore: [0],
      }));
    }

    if (dto.nextServiceDate) {
      const d = this.reminderDate(dto.nextServiceDate, 7);
      if (d) tasks.push(this.reminders.createSystemReminder({
        userId, title: `${vehicleName} service due soon`,
        dueDate: d, linkedEntityType: LinkedEntityType.VEHICLE, linkedEntityId: vehicleId,
        recurrenceType: RecurrenceType.ONCE, notifyBefore: [0],
      }));
    }

    await Promise.all(tasks);
  }

  private reminderDate(dateStr: string, daysBefore: number): Date | null {
    const d = new Date(dateStr);
    d.setDate(d.getDate() - daysBefore);
    return d > new Date() ? d : null;
  }
}

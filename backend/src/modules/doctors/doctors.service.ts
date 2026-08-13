import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateDoctorDto, UpdateDoctorDto } from './dto/doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateDoctorDto) {
    return this.prisma.doctor.create({ data: { userId, ...dto } });
  }

  findAll(userId: string) {
    return this.prisma.doctor.findMany({ where: { userId }, orderBy: { name: 'asc' } });
  }

  async findOne(userId: string, id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: { appointments: { orderBy: { date: 'desc' }, take: 5 } },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');
    if (doctor.userId !== userId) throw new ForbiddenException();
    return doctor;
  }

  async update(userId: string, id: string, dto: UpdateDoctorDto) {
    await this.findOne(userId, id);
    return this.prisma.doctor.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.doctor.delete({ where: { id } });
    return { message: 'Doctor deleted' };
  }
}

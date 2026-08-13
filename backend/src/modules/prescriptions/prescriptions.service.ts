import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { StorageService } from '../../shared/storage/storage.service';
import { CreatePrescriptionDto, UpdatePrescriptionDto } from './dto/prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async create(userId: string, dto: CreatePrescriptionDto, file?: Express.Multer.File) {
    let fileData: { fileName: string; filePath: string; fileSize: number; mimeType: string } | undefined;

    if (file) {
      const ext = path.extname(file.originalname);
      const storagePath = `users/${userId}/prescriptions/${randomUUID()}${ext}`;
      const result = await this.storage.upload(file.buffer, storagePath, {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      });
      fileData = { fileName: file.originalname, filePath: result.path, fileSize: file.size, mimeType: file.mimetype };
    }

    return this.prisma.prescription.create({
      data: {
        userId,
        doctorName: dto.doctorName,
        clinicName: dto.clinicName,
        date: new Date(dto.date),
        notes: dto.notes,
        ...fileData,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.prescription.findMany({
      where: { userId },
      include: { medicines: { select: { id: true, name: true, dosage: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const p = await this.prisma.prescription.findUnique({
      where: { id },
      include: { medicines: true, appointments: { select: { id: true, date: true, purpose: true } } },
    });
    if (!p) throw new NotFoundException('Prescription not found');
    if (p.userId !== userId) throw new ForbiddenException();
    return p;
  }

  async update(userId: string, id: string, dto: UpdatePrescriptionDto) {
    await this.findOne(userId, id);
    return this.prisma.prescription.update({
      where: { id },
      data: {
        doctorName: dto.doctorName,
        clinicName: dto.clinicName,
        date: dto.date ? new Date(dto.date) : undefined,
        notes: dto.notes,
      },
    });
  }

  async remove(userId: string, id: string) {
    const p = await this.findOne(userId, id);
    if (p.filePath) await this.storage.delete(p.filePath);
    await this.prisma.prescription.delete({ where: { id } });
    return { message: 'Prescription deleted' };
  }

  async getDownloadUrl(userId: string, id: string) {
    const p = await this.findOne(userId, id);
    if (!p.filePath) throw new NotFoundException('No file attached');
    const url = await this.storage.getSignedUrl(p.filePath, 900);
    return { url, expiresAt: new Date(Date.now() + 900 * 1000) };
  }
}

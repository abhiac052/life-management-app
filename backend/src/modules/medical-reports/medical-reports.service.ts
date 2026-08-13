import {
  BadRequestException, ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import { MedicalReportType } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { fileTypeFromBuffer } from 'file-type';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { StorageService } from '../../shared/storage/storage.service';
import { CreateMedicalReportDto, UpdateMedicalReportDto } from './dto/medical-report.dto';

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

@Injectable()
export class MedicalReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async create(userId: string, dto: CreateMedicalReportDto, file: Express.Multer.File) {
    const detected = await fileTypeFromBuffer(file.buffer);
    const mimeType = detected?.mime ?? file.mimetype;
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new BadRequestException('Only PDF, JPEG, and PNG files are allowed');
    }

    const ext = path.extname(file.originalname) || `.${detected?.ext ?? 'bin'}`;
    const storagePath = `users/${userId}/medical-reports/${randomUUID()}${ext}`;
    const result = await this.storage.upload(file.buffer, storagePath, {
      originalName: file.originalname,
      mimeType,
      size: file.size,
    });

    return this.prisma.medicalReport.create({
      data: {
        userId,
        title: dto.title,
        type: dto.type,
        date: new Date(dto.date),
        doctorLab: dto.doctorLab,
        notes: dto.notes,
        fileName: file.originalname,
        filePath: result.path,
        fileSize: file.size,
        mimeType,
      },
    });
  }

  findAll(userId: string, type?: MedicalReportType) {
    return this.prisma.medicalReport.findMany({
      where: { userId, ...(type ? { type } : {}) },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const report = await this.prisma.medicalReport.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');
    if (report.userId !== userId) throw new ForbiddenException();
    return report;
  }

  async update(userId: string, id: string, dto: UpdateMedicalReportDto) {
    await this.findOne(userId, id);
    return this.prisma.medicalReport.update({
      where: { id },
      data: {
        title: dto.title,
        type: dto.type,
        date: dto.date ? new Date(dto.date) : undefined,
        doctorLab: dto.doctorLab,
        notes: dto.notes,
      },
    });
  }

  async remove(userId: string, id: string) {
    const report = await this.findOne(userId, id);
    await this.storage.delete(report.filePath);
    await this.prisma.medicalReport.delete({ where: { id } });
    return { message: 'Report deleted' };
  }

  async getDownloadUrl(userId: string, id: string) {
    const report = await this.findOne(userId, id);
    const url = await this.storage.getSignedUrl(report.filePath, 900);
    return { url, expiresAt: new Date(Date.now() + 900 * 1000) };
  }
}

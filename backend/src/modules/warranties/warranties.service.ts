import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { LinkedEntityType, RecurrenceType } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { StorageService } from '../../shared/storage/storage.service';
import { RemindersService } from '../reminders/reminders.service';
import { CreateWarrantyDto, UpdateWarrantyDto } from './dto/warranty.dto';

@Injectable()
export class WarrantiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly reminders: RemindersService,
  ) {}

  async create(userId: string, dto: CreateWarrantyDto, file?: Express.Multer.File) {
    let fileData: { invoiceFileName: string; invoiceFilePath: string; invoiceFileSize: number; invoiceMimeType: string } | undefined;

    if (file) {
      const ext = path.extname(file.originalname);
      const storagePath = `users/${userId}/warranties/${randomUUID()}${ext}`;
      const result = await this.storage.upload(file.buffer, storagePath, {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      });
      fileData = {
        invoiceFileName: file.originalname,
        invoiceFilePath: result.path,
        invoiceFileSize: file.size,
        invoiceMimeType: file.mimetype,
      };
    }

    const warranty = await this.prisma.warranty.create({
      data: {
        userId,
        productName: dto.productName,
        brand: dto.brand,
        model: dto.model,
        purchaseDate: new Date(dto.purchaseDate),
        expiryDate: new Date(dto.expiryDate),
        seller: dto.seller,
        notes: dto.notes,
        ...fileData,
      },
    });

    await this.createExpiryReminder(userId, warranty.id, warranty.productName, warranty.expiryDate);
    return warranty;
  }

  findAll(userId: string) {
    return this.prisma.warranty.findMany({
      where: { userId },
      orderBy: { expiryDate: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const w = await this.prisma.warranty.findUnique({ where: { id } });
    if (!w) throw new NotFoundException('Warranty not found');
    if (w.userId !== userId) throw new ForbiddenException();
    return w;
  }

  async update(userId: string, id: string, dto: UpdateWarrantyDto) {
    await this.findOne(userId, id);
    const warranty = await this.prisma.warranty.update({
      where: { id },
      data: {
        productName: dto.productName,
        brand: dto.brand,
        model: dto.model,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        seller: dto.seller,
        notes: dto.notes,
      },
    });

    if (dto.expiryDate) {
      await this.reminders.deleteLinkedReminders(LinkedEntityType.WARRANTY, id);
      await this.createExpiryReminder(userId, id, warranty.productName, warranty.expiryDate);
    }

    return warranty;
  }

  async remove(userId: string, id: string) {
    const w = await this.findOne(userId, id);
    if (w.invoiceFilePath) await this.storage.delete(w.invoiceFilePath);
    await this.reminders.deleteLinkedReminders(LinkedEntityType.WARRANTY, id);
    await this.prisma.warranty.delete({ where: { id } });
    return { message: 'Warranty deleted' };
  }

  async getInvoiceUrl(userId: string, id: string) {
    const w = await this.findOne(userId, id);
    if (!w.invoiceFilePath) throw new NotFoundException('No invoice attached');
    const url = await this.storage.getSignedUrl(w.invoiceFilePath, 900);
    return { url, expiresAt: new Date(Date.now() + 900 * 1000) };
  }

  private async createExpiryReminder(userId: string, warrantyId: string, productName: string, expiryDate: Date) {
    const reminderDate = new Date(expiryDate);
    reminderDate.setDate(reminderDate.getDate() - 30); // 30 days before
    if (reminderDate <= new Date()) return;
    await this.reminders.createSystemReminder({
      userId,
      title: `${productName} warranty expires soon`,
      dueDate: reminderDate,
      linkedEntityType: LinkedEntityType.WARRANTY,
      linkedEntityId: warrantyId,
      recurrenceType: RecurrenceType.ONCE,
      notifyBefore: [0],
    });
  }
}

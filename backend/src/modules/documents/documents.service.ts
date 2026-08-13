import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { DocumentCategory, LinkedEntityType, RecurrenceType } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { fileTypeFromBuffer } from 'file-type';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { StorageService } from '../../shared/storage/storage.service';
import { RemindersService } from '../reminders/reminders.service';
import { CreateDocumentDto, UpdateDocumentDto, QueryDocumentsDto } from './dto/document.dto';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_USER_QUOTA = 500 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly remindersService: RemindersService,
  ) {}

  async upload(userId: string, file: Express.Multer.File, dto: CreateDocumentDto) {
    if (file.size > MAX_FILE_SIZE) throw new PayloadTooLargeException('File exceeds 10MB limit');

    const detected = await fileTypeFromBuffer(file.buffer);
    const mimeType = detected?.mime ?? file.mimetype;
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new UnsupportedMediaTypeException('Only PDF, JPEG, and PNG files are allowed');
    }

    const usage = await this.prisma.document.aggregate({
      where: { userId, deletedAt: null },
      _sum: { fileSize: true },
    });
    if ((usage._sum.fileSize ?? 0) + file.size > MAX_USER_QUOTA) {
      throw new BadRequestException('Storage quota exceeded');
    }

    const ext = path.extname(file.originalname) || `.${detected?.ext ?? 'bin'}`;
    const storagePath = `users/${userId}/documents/${randomUUID()}${ext}`;

    const result = await this.storage.upload(file.buffer, storagePath, {
      originalName: file.originalname,
      mimeType,
      size: file.size,
    });

    const document = await this.prisma.document.create({
      data: {
        userId,
        name: dto.name,
        category: dto.category,
        description: dto.description,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        tags: dto.tags ?? [],
        notes: dto.notes,
        fileName: file.originalname,
        filePath: result.path,
        fileSize: file.size,
        mimeType,
      },
    });

    if (dto.setExpiryReminder && dto.expiryDate) {
      const daysBefore = dto.reminderDaysBefore ?? 30;
      const reminderDate = new Date(dto.expiryDate);
      reminderDate.setDate(reminderDate.getDate() - daysBefore);
      if (reminderDate > new Date()) {
        await this.remindersService.createSystemReminder({
          userId,
          title: `${dto.name} expires soon`,
          dueDate: reminderDate,
          linkedEntityType: LinkedEntityType.DOCUMENT,
          linkedEntityId: document.id,
          recurrenceType: RecurrenceType.ONCE,
          notifyBefore: [0],
        });
      }
    }

    return document;
  }

  async findAll(userId: string, query: QueryDocumentsDto) {
    const page = parseInt(query.page ?? '1', 10);
    const limit = Math.min(parseInt(query.limit ?? '20', 10), 50);
    const where = {
      userId,
      deletedAt: query.deleted ? { not: null } : null,
      ...(query.category ? { category: query.category as DocumentCategory } : {}),
      ...(query.search ? {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { tags: { has: query.search } },
        ],
      } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.document.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.document.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(userId: string, id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.userId !== userId) throw new ForbiddenException();
    return doc;
  }

  async update(userId: string, id: string, dto: UpdateDocumentDto) {
    await this.findOne(userId, id);
    return this.prisma.document.update({
      where: { id },
      data: {
        ...dto,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      },
    });
  }

  async softDelete(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.document.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Document deleted' };
  }

  async restore(userId: string, id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.userId !== userId) throw new ForbiddenException();
    if (!doc.deletedAt) throw new BadRequestException('Document is not deleted');
    return this.prisma.document.update({ where: { id }, data: { deletedAt: null } });
  }

  async getDownloadUrl(userId: string, id: string) {
    const doc = await this.findOne(userId, id);
    if (doc.deletedAt) throw new BadRequestException('Document has been deleted');
    const url = await this.storage.getSignedUrl(doc.filePath, 900);
    const expiresAt = new Date(Date.now() + 900 * 1000);
    return { url, expiresAt };
  }

  async purgeExpiredDeleted() {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const expired = await this.prisma.document.findMany({ where: { deletedAt: { lte: cutoff } } });
    for (const doc of expired) {
      await this.storage.delete(doc.filePath);
      await this.prisma.document.delete({ where: { id: doc.id } });
    }
    return expired.length;
  }
}

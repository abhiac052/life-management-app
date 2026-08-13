import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { UpsertHealthProfileDto } from './dto/health-profile.dto';

@Injectable()
export class HealthProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string) {
    return this.prisma.healthProfile.upsert({
      where: { userId },
      create: { userId, allergies: [] },
      update: {},
    });
  }

  async upsert(userId: string, dto: UpsertHealthProfileDto) {
    return this.prisma.healthProfile.upsert({
      where: { userId },
      create: { userId, allergies: [], ...dto },
      update: dto,
    });
  }
}

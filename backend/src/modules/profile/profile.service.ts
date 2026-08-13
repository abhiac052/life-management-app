import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ChangePasswordDto, DeleteAccountDto, UpdateProfileDto } from './dto/profile.dto';
import { UpdatePreferencesDto } from './dto/preferences.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, avatarUrl: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    const rounds = this.config.get<number>('auth.bcryptRounds') ?? 12;
    const passwordHash = await bcrypt.hash(dto.newPassword, rounds);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    // Revoke all refresh tokens on password change
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { message: 'Password changed successfully' };
  }

  async getPreferences(userId: string) {
    const prefs = await this.prisma.userPreference.findUnique({ where: { userId } });
    if (!prefs) throw new NotFoundException('Preferences not found');
    return prefs;
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    return this.prisma.userPreference.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });
  }

  async deleteAccount(userId: string, dto: DeleteAccountDto) {
    if (dto.confirmation !== 'DELETE') {
      throw new BadRequestException('Confirmation must be the word DELETE');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new ForbiddenException('Invalid password');

    // Cascade delete — Prisma schema has onDelete: Cascade on all user relations
    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'Account deleted successfully' };
  }
}

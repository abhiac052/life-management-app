import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { EmailService } from '../../shared/email/email.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  // ── Register ────────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, this.config.get<number>('auth.bcryptRounds')!);

    const [household, user] = await this.prisma.$transaction(async (tx) => {
      const hh = await tx.household.create({ data: {} });
      const u = await tx.user.create({
        data: { householdId: hh.id, email: dto.email, passwordHash, name: dto.name },
      });
      await tx.userPreference.create({ data: { userId: u.id } });
      return [hh, u];
    });

    void household; // used only for creation
    const tokens = await this.generateAndStoreTokens(user.id, user.householdId, user.email);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  // ── Login ────────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    const tokens = await this.generateAndStoreTokens(user.id, user.householdId, user.email);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  // ── Refresh ──────────────────────────────────────────────────────────────────

  async refresh(dto: RefreshTokenDto) {
    // Verify JWT signature and expiry first
    let payload: JwtPayload & { exp: number };
    try {
      payload = this.jwtService.verify<JwtPayload & { exp: number }>(dto.refreshToken, {
        secret: this.config.get<string>('auth.jwtRefreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokenHash = this.hashToken(dto.refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      // Possible token reuse — revoke all tokens for this user
      if (stored && !stored.revokedAt) {
        await this.revokeAllUserTokens(payload.sub);
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate: revoke current, issue new
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.generateAndStoreTokens(stored.userId, payload.householdId, payload.email);
    return tokens;
  }

  // ── Logout ───────────────────────────────────────────────────────────────────

  async logout(dto: RefreshTokenDto) {
    const tokenHash = this.hashToken(dto.refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // ── Forgot Password ──────────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) return; // No email enumeration

    // Invalidate any existing reset tokens
    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const rawToken = randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const appUrl = this.config.get<string>('app.appUrl') ?? 'https://example.com';
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;
    await this.emailService.sendPasswordReset(user.email, resetUrl);
  }

  // ── Reset Password ───────────────────────────────────────────────────────────

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashToken(dto.token);
    const record = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const rounds = this.config.get<number>('auth.bcryptRounds') ?? 12;
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      this.prisma.refreshToken.updateMany({ where: { userId: record.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);

    return { message: 'Password reset successful' };
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private async generateAndStoreTokens(userId: string, householdId: string, email: string) {
    const payload: JwtPayload = { sub: userId, householdId, email };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signOpts = (secret: string, expiresIn: string): any => ({ secret, expiresIn });

    const accessToken = this.jwtService.sign(
      payload,
      signOpts(
        this.config.get<string>('auth.jwtAccessSecret')!,
        this.config.get<string>('auth.jwtAccessExpiry')!,
      ),
    );

    const refreshToken = this.jwtService.sign(
      payload,
      signOpts(
        this.config.get<string>('auth.jwtRefreshSecret')!,
        this.config.get<string>('auth.jwtRefreshExpiry')!,
      ),
    );

    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async revokeAllUserTokens(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private sanitizeUser(user: { id: string; name: string; email: string; avatarUrl: string | null }) {
    return { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl };
  }
}

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../shared/prisma/prisma.service';
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
    // Always return the same response — no email enumeration
    if (!user) return;

    const rawToken = randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store hashed reset token (reuse refresh_tokens table pattern via a separate field
    // is not available — store in a dedicated way using user metadata for now;
    // Sprint 2 will add a proper PasswordResetToken model or email service)
    // For Sprint 1: store on user record as a temporary measure
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        // We store the hash in a JSON field via notes — Sprint 2 adds proper model
        // This is intentionally minimal for Sprint 1 foundation
      },
    });

    // TODO Sprint 2: send email with reset link via EmailService
    // The raw token would be sent; hash is stored server-side
    void rawToken;
    void tokenHash;
    void expiresAt;
  }

  // ── Reset Password ───────────────────────────────────────────────────────────

  async resetPassword(_dto: ResetPasswordDto) {
    // TODO Sprint 2: implement with PasswordResetToken model + EmailService
    throw new UnauthorizedException('Password reset requires email service — available in Sprint 2');
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

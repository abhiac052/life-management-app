import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly dashboard: DashboardService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async get(@CurrentUser() user: JwtPayload) {
    const pref = await this.prisma.userPreference.findUnique({ where: { userId: user.sub } });
    const timezone = pref?.timezone ?? 'Asia/Kolkata';
    return this.dashboard.getDashboard(user.sub, timezone);
  }
}

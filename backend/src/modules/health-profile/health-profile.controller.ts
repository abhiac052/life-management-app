import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { HealthProfileService } from './health-profile.service';
import { UpsertHealthProfileDto } from './dto/health-profile.dto';

@Controller('health-profile')
@UseGuards(JwtAuthGuard)
export class HealthProfileController {
  constructor(private readonly healthProfile: HealthProfileService) {}

  @Get()
  get(@CurrentUser() u: JwtPayload) {
    return this.healthProfile.get(u.sub);
  }

  @Patch()
  upsert(@CurrentUser() u: JwtPayload, @Body() dto: UpsertHealthProfileDto) {
    return this.healthProfile.upsert(u.sub, dto);
  }
}

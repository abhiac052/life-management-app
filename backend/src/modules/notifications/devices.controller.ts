import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RegisterDeviceDto } from './dto/register-device.dto';

@Controller('devices')
@UseGuards(JwtAuthGuard)
export class DevicesController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@CurrentUser() user: JwtPayload, @Body() dto: RegisterDeviceDto) {
    await this.prisma.deviceToken.upsert({
      where: { token: dto.token },
      update: { userId: user.sub, platform: dto.platform, isActive: true },
      create: { userId: user.sub, token: dto.token, platform: dto.platform },
    });
    return { message: 'Device registered' };
  }

  @Delete(':token')
  @HttpCode(HttpStatus.OK)
  async unregister(@CurrentUser() user: JwtPayload, @Param('token') token: string) {
    await this.prisma.deviceToken.updateMany({
      where: { token, userId: user.sub },
      data: { isActive: false },
    });
    return { message: 'Device unregistered' };
  }
}

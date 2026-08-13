import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { MedicinesService } from './medicines.service';
import {
  CreateMedicineDto,
  CreateScheduleDto,
  LogDoseDto,
  UpdateMedicineDto,
  UpdateStockDto,
} from './dto/medicine.dto';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Controller('medicines')
@UseGuards(JwtAuthGuard)
export class MedicinesController {
  constructor(
    private readonly medicines: MedicinesService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateMedicineDto) {
    return this.medicines.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query('isActive') isActive?: string) {
    const active = isActive === undefined ? undefined : isActive === 'true';
    return this.medicines.findAll(user.sub, active);
  }

  @Get('today')
  async getToday(@CurrentUser() user: JwtPayload) {
    const pref = await this.prisma.userPreference.findUnique({ where: { userId: user.sub } });
    const timezone = pref?.timezone ?? 'Asia/Kolkata';
    return this.medicines.getToday(user.sub, timezone);
  }

  @Get(':id/adherence')
  getAdherence(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.medicines.getAdherence(user.sub, id, from, to);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.medicines.findOne(user.sub, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateMedicineDto) {
    return this.medicines.update(user.sub, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.medicines.remove(user.sub, id);
  }

  @Patch(':id/deactivate')
  deactivate(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.medicines.deactivate(user.sub, id);
  }

  @Post(':id/schedules')
  addSchedule(
    @CurrentUser() user: JwtPayload,
    @Param('id') medicineId: string,
    @Body() dto: CreateScheduleDto,
  ) {
    return this.medicines.addSchedule(user.sub, medicineId, dto);
  }

  @Delete(':id/schedules/:scheduleId')
  removeSchedule(
    @CurrentUser() user: JwtPayload,
    @Param('id') medicineId: string,
    @Param('scheduleId') scheduleId: string,
  ) {
    return this.medicines.removeSchedule(user.sub, medicineId, scheduleId);
  }

  @Post('doses/log')
  logDose(@CurrentUser() user: JwtPayload, @Body() dto: LogDoseDto) {
    return this.medicines.logDose(user.sub, dto);
  }

  @Patch(':id/stock')
  upsertStock(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateStockDto,
  ) {
    return this.medicines.upsertStock(user.sub, id, dto);
  }
}

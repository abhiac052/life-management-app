import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';
import { AppointmentStatus } from '@prisma/client';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointments: AppointmentsService) {}

  @Post() create(@CurrentUser() u: JwtPayload, @Body() dto: CreateAppointmentDto) { return this.appointments.create(u.sub, dto); }
  @Get() findAll(@CurrentUser() u: JwtPayload, @Query('status') status?: AppointmentStatus) { return this.appointments.findAll(u.sub, status); }
  @Get(':id') findOne(@CurrentUser() u: JwtPayload, @Param('id') id: string) { return this.appointments.findOne(u.sub, id); }
  @Patch(':id') update(@CurrentUser() u: JwtPayload, @Param('id') id: string, @Body() dto: UpdateAppointmentDto) { return this.appointments.update(u.sub, id, dto); }
  @Delete(':id') remove(@CurrentUser() u: JwtPayload, @Param('id') id: string) { return this.appointments.remove(u.sub, id); }
}

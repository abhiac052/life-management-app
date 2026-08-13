import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto, UpdateDoctorDto } from './dto/doctor.dto';

@Controller('doctors')
@UseGuards(JwtAuthGuard)
export class DoctorsController {
  constructor(private readonly doctors: DoctorsService) {}

  @Post() create(@CurrentUser() u: JwtPayload, @Body() dto: CreateDoctorDto) { return this.doctors.create(u.sub, dto); }
  @Get() findAll(@CurrentUser() u: JwtPayload) { return this.doctors.findAll(u.sub); }
  @Get(':id') findOne(@CurrentUser() u: JwtPayload, @Param('id') id: string) { return this.doctors.findOne(u.sub, id); }
  @Patch(':id') update(@CurrentUser() u: JwtPayload, @Param('id') id: string, @Body() dto: UpdateDoctorDto) { return this.doctors.update(u.sub, id, dto); }
  @Delete(':id') remove(@CurrentUser() u: JwtPayload, @Param('id') id: string) { return this.doctors.remove(u.sub, id); }
}

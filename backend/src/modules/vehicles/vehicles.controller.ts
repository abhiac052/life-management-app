import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';

@Controller('vehicles')
@UseGuards(JwtAuthGuard)
export class VehiclesController {
  constructor(private readonly vehicles: VehiclesService) {}

  @Post() create(@CurrentUser() u: JwtPayload, @Body() dto: CreateVehicleDto) { return this.vehicles.create(u.sub, dto); }
  @Get() findAll(@CurrentUser() u: JwtPayload) { return this.vehicles.findAll(u.sub); }
  @Get(':id') findOne(@CurrentUser() u: JwtPayload, @Param('id') id: string) { return this.vehicles.findOne(u.sub, id); }
  @Patch(':id') update(@CurrentUser() u: JwtPayload, @Param('id') id: string, @Body() dto: UpdateVehicleDto) { return this.vehicles.update(u.sub, id, dto); }
  @Delete(':id') remove(@CurrentUser() u: JwtPayload, @Param('id') id: string) { return this.vehicles.remove(u.sub, id); }
}

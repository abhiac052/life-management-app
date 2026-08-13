import {
  Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile,
  UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto, UpdatePrescriptionDto } from './dto/prescription.dto';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptions: PrescriptionsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @CurrentUser() u: JwtPayload,
    @Body() dto: CreatePrescriptionDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.prescriptions.create(u.sub, dto, file);
  }

  @Get() findAll(@CurrentUser() u: JwtPayload) { return this.prescriptions.findAll(u.sub); }
  @Get(':id') findOne(@CurrentUser() u: JwtPayload, @Param('id') id: string) { return this.prescriptions.findOne(u.sub, id); }
  @Patch(':id') update(@CurrentUser() u: JwtPayload, @Param('id') id: string, @Body() dto: UpdatePrescriptionDto) { return this.prescriptions.update(u.sub, id, dto); }
  @Delete(':id') remove(@CurrentUser() u: JwtPayload, @Param('id') id: string) { return this.prescriptions.remove(u.sub, id); }
  @Get(':id/download-url') getDownloadUrl(@CurrentUser() u: JwtPayload, @Param('id') id: string) { return this.prescriptions.getDownloadUrl(u.sub, id); }
}

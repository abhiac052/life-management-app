import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query,
  UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { MedicalReportsService } from './medical-reports.service';
import { CreateMedicalReportDto, UpdateMedicalReportDto } from './dto/medical-report.dto';
import { MedicalReportType } from '@prisma/client';

@Controller('medical-reports')
@UseGuards(JwtAuthGuard)
export class MedicalReportsController {
  constructor(private readonly reports: MedicalReportsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @CurrentUser() u: JwtPayload,
    @Body() dto: CreateMedicalReportDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new Error('File is required');
    return this.reports.create(u.sub, dto, file);
  }

  @Get() findAll(@CurrentUser() u: JwtPayload, @Query('type') type?: MedicalReportType) { return this.reports.findAll(u.sub, type); }
  @Get(':id') findOne(@CurrentUser() u: JwtPayload, @Param('id') id: string) { return this.reports.findOne(u.sub, id); }
  @Patch(':id') update(@CurrentUser() u: JwtPayload, @Param('id') id: string, @Body() dto: UpdateMedicalReportDto) { return this.reports.update(u.sub, id, dto); }
  @Delete(':id') remove(@CurrentUser() u: JwtPayload, @Param('id') id: string) { return this.reports.remove(u.sub, id); }
  @Get(':id/download-url') getDownloadUrl(@CurrentUser() u: JwtPayload, @Param('id') id: string) { return this.reports.getDownloadUrl(u.sub, id); }
}

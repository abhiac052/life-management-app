import {
  Body, Controller, Delete, Get, Param, Patch, Post,
  UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { WarrantiesService } from './warranties.service';
import { CreateWarrantyDto, UpdateWarrantyDto } from './dto/warranty.dto';

@Controller('warranties')
@UseGuards(JwtAuthGuard)
export class WarrantiesController {
  constructor(private readonly warranties: WarrantiesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('invoice'))
  create(
    @CurrentUser() u: JwtPayload,
    @Body() dto: CreateWarrantyDto,
    @UploadedFile() invoice?: Express.Multer.File,
  ) {
    return this.warranties.create(u.sub, dto, invoice);
  }

  @Get() findAll(@CurrentUser() u: JwtPayload) { return this.warranties.findAll(u.sub); }
  @Get(':id') findOne(@CurrentUser() u: JwtPayload, @Param('id') id: string) { return this.warranties.findOne(u.sub, id); }
  @Patch(':id') update(@CurrentUser() u: JwtPayload, @Param('id') id: string, @Body() dto: UpdateWarrantyDto) { return this.warranties.update(u.sub, id, dto); }
  @Delete(':id') remove(@CurrentUser() u: JwtPayload, @Param('id') id: string) { return this.warranties.remove(u.sub, id); }
  @Get(':id/invoice-url') getInvoiceUrl(@CurrentUser() u: JwtPayload, @Param('id') id: string) { return this.warranties.getInvoiceUrl(u.sub, id); }
}

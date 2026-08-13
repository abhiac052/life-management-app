import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, QueryDocumentsDto, UpdateDocumentDto } from './dto/document.dto';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateDocumentDto,
  ) {
    if (!file) throw new Error('File is required');
    return this.documentsService.upload(user.sub, file, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query() query: QueryDocumentsDto) {
    return this.documentsService.findAll(user.sub, query);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.documentsService.findOne(user.sub, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  softDelete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.documentsService.softDelete(user.sub, id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  restore(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.documentsService.restore(user.sub, id);
  }

  @Get(':id/download-url')
  getDownloadUrl(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.documentsService.getDownloadUrl(user.sub, id);
  }
}

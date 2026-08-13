import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { RemindersService } from './reminders.service';
import { CreateReminderDto, SnoozeReminderDto, UpdateReminderDto } from './dto/reminder.dto';

@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateReminderDto) {
    return this.remindersService.create(user.sub, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.remindersService.findAll(user.sub, status, +page, Math.min(+limit, 50));
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.remindersService.findOne(user.sub, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateReminderDto) {
    return this.remindersService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.remindersService.remove(user.sub, id);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  complete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.remindersService.complete(user.sub, id);
  }

  @Post(':id/skip')
  @HttpCode(HttpStatus.OK)
  skip(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.remindersService.skip(user.sub, id);
  }

  @Post(':id/snooze')
  @HttpCode(HttpStatus.OK)
  snooze(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: SnoozeReminderDto) {
    return this.remindersService.snooze(user.sub, id, dto);
  }

  @Patch(':id/pause')
  pause(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.remindersService.pause(user.sub, id);
  }

  @Patch(':id/resume')
  resume(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.remindersService.resume(user.sub, id);
  }

  @Get(':id/history')
  getHistory(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.remindersService.getHistory(user.sub, id);
  }
}

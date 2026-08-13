import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { RecurrenceType } from '@prisma/client';

export class CreateReminderDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  dueDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(RecurrenceType)
  @IsOptional()
  recurrenceType?: RecurrenceType;

  @IsOptional()
  recurrenceRule?: Record<string, unknown>;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  notifyBefore?: number[];
}

export class UpdateReminderDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(RecurrenceType)
  @IsOptional()
  recurrenceType?: RecurrenceType;

  @IsOptional()
  recurrenceRule?: Record<string, unknown>;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  notifyBefore?: number[];
}

export class SnoozeReminderDto {
  @IsInt()
  @Min(1)
  duration: number; // minutes
}

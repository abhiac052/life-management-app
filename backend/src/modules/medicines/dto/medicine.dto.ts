import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { MedicineForm, MealRelation } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';

export class CreateScheduleDto {
  @IsString() time: string;
  @IsOptional() @IsString() label?: string;
  @IsArray() @IsInt({ each: true }) daysOfWeek: number[];
}

export class CreateMedicineDto {
  @IsString() name: string;
  @IsString() dosage: string;
  @IsEnum(MedicineForm) form: MedicineForm;
  @IsOptional() @IsEnum(MealRelation) mealRelation?: MealRelation;
  @IsOptional() @IsString() instructions?: string;
  @IsOptional() @IsString() notes?: string;
  @IsDateString() startDate: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsString() prescriptionId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateScheduleDto)
  schedules?: CreateScheduleDto[];

  // Stock (optional)
  @IsOptional() @Transform(({ value }) => parseInt(value, 10)) @IsInt() @Min(0) stockQty?: number;
  @IsOptional() @Transform(({ value }) => parseInt(value, 10)) @IsInt() @Min(1) unitsPerDose?: number;
  @IsOptional() @Transform(({ value }) => parseInt(value, 10)) @IsInt() @Min(1) dosesPerDay?: number;
  @IsOptional() @Transform(({ value }) => parseInt(value, 10)) @IsInt() @Min(1) refillThreshold?: number;
}

export class UpdateMedicineDto extends PartialType(CreateMedicineDto) {}

export class LogDoseDto {
  @IsString() scheduleId: string;
  @IsDateString() scheduledAt: string;
  @IsString() action: string; // 'taken' | 'skipped'
  @IsOptional() @IsString() note?: string;
}

export class UpdateStockDto {
  @IsInt() @Min(0) currentQty: number;
  @IsOptional() @IsInt() @Min(1) unitsPerDose?: number;
  @IsOptional() @IsInt() @Min(1) dosesPerDay?: number;
  @IsOptional() @IsInt() @Min(1) refillThreshold?: number;
}

export class AdherenceQueryDto {
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
}

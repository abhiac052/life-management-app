import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { MedicalReportType } from '@prisma/client';

export class CreateMedicalReportDto {
  @IsString() title: string;
  @IsEnum(MedicalReportType) type: MedicalReportType;
  @IsDateString() date: string;
  @IsOptional() @IsString() doctorLab?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateMedicalReportDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsEnum(MedicalReportType) type?: MedicalReportType;
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsString() doctorLab?: string;
  @IsOptional() @IsString() notes?: string;
}

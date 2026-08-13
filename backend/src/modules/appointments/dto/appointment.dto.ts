import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @IsOptional() @IsString() doctorId?: string;
  @IsString() doctorName: string;
  @IsDateString() date: string;
  @IsString() time: string;
  @IsOptional() @IsString() purpose?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() prescriptionId?: string;
}

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @IsOptional() @IsEnum(AppointmentStatus) status?: AppointmentStatus;
}

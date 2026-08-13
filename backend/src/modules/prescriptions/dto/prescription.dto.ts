import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreatePrescriptionDto {
  @IsString() doctorName: string;
  @IsOptional() @IsString() clinicName?: string;
  @IsDateString() date: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdatePrescriptionDto {
  @IsOptional() @IsString() doctorName?: string;
  @IsOptional() @IsString() clinicName?: string;
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsString() notes?: string;
}

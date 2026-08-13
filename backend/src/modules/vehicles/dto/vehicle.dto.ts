import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { VehicleType } from '@prisma/client';

export class CreateVehicleDto {
  @IsString() name: string;
  @IsEnum(VehicleType) type: VehicleType;
  @IsOptional() @IsString() registrationNo?: string;
  @IsOptional() @IsDateString() insuranceExpiry?: string;
  @IsOptional() @IsDateString() pucExpiry?: string;
  @IsOptional() @IsDateString() nextServiceDate?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateVehicleDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEnum(VehicleType) type?: VehicleType;
  @IsOptional() @IsString() registrationNo?: string;
  @IsOptional() @IsDateString() insuranceExpiry?: string;
  @IsOptional() @IsDateString() pucExpiry?: string;
  @IsOptional() @IsDateString() nextServiceDate?: string;
  @IsOptional() @IsString() notes?: string;
}

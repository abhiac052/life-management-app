import { IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateDoctorDto {
  @IsString() name: string;
  @IsOptional() @IsString() specialization?: string;
  @IsOptional() @IsString() hospital?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {}

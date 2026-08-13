import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpsertHealthProfileDto {
  @IsOptional() @IsString() bloodGroup?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) allergies?: string[];
  @IsOptional() @IsNumber() @Min(0) heightCm?: number;
  @IsOptional() @IsNumber() @Min(0) weightKg?: number;
  @IsOptional() @IsString() emergencyName?: string;
  @IsOptional() @IsString() emergencyPhone?: string;
  @IsOptional() @IsString() medicalNotes?: string;
}

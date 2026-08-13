import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateWarrantyDto {
  @IsString() productName: string;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsString() model?: string;
  @IsDateString() purchaseDate: string;
  @IsDateString() expiryDate: string;
  @IsOptional() @IsString() seller?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateWarrantyDto {
  @IsOptional() @IsString() productName?: string;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsString() model?: string;
  @IsOptional() @IsDateString() purchaseDate?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() @IsString() seller?: string;
  @IsOptional() @IsString() notes?: string;
}

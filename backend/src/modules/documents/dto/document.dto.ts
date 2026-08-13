import { Transform } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';
import { DocumentCategory } from '@prisma/client';

export class CreateDocumentDto {
  @IsString()
  name: string;

  @IsEnum(DocumentCategory)
  category: DocumentCategory;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  issueDate?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  notes?: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  setExpiryReminder?: boolean;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @IsOptional()
  reminderDaysBefore?: number;
}

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(DocumentCategory)
  @IsOptional()
  category?: DocumentCategory;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  issueDate?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  notes?: string;
}

export class QueryDocumentsDto {
  @IsEnum(DocumentCategory)
  @IsOptional()
  category?: DocumentCategory;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;

  @IsBoolean()
  @IsOptional()
  deleted?: boolean;
}

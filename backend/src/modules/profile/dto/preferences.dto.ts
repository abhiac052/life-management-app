import { IsBoolean, IsOptional, IsString, IsIn } from 'class-validator';

export class UpdatePreferencesDto {
  @IsString() @IsOptional() timezone?: string;
  @IsBoolean() @IsOptional() notificationsEnabled?: boolean;
  @IsBoolean() @IsOptional() medicinePush?: boolean;
  @IsBoolean() @IsOptional() appointmentPush?: boolean;
  @IsBoolean() @IsOptional() reminderPush?: boolean;
  @IsBoolean() @IsOptional() warrantyPush?: boolean;
  @IsBoolean() @IsOptional() vehiclePush?: boolean;
  @IsBoolean() @IsOptional() documentPush?: boolean;
  @IsBoolean() @IsOptional() quietHoursEnabled?: boolean;
  @IsString() @IsOptional() quietHoursStart?: string;
  @IsString() @IsOptional() quietHoursEnd?: string;
  @IsString() @IsIn(['light', 'dark', 'system']) @IsOptional() theme?: string;
  @IsString() @IsIn(['12h', '24h']) @IsOptional() timeFormat?: string;
  @IsString() @IsOptional() defaultReminderTime?: string;
}

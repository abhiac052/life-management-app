import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ProfileService } from './profile.service';
import { ChangePasswordDto, DeleteAccountDto, UpdateProfileDto } from './dto/profile.dto';
import { UpdatePreferencesDto } from './dto/preferences.dto';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.profileService.getProfile(user.sub);
  }

  @Patch()
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(user.sub, dto);
  }

  @Patch('password')
  @HttpCode(HttpStatus.OK)
  changePassword(@CurrentUser() user: JwtPayload, @Body() dto: ChangePasswordDto) {
    return this.profileService.changePassword(user.sub, dto);
  }

  @Get('preferences')
  getPreferences(@CurrentUser() user: JwtPayload) {
    return this.profileService.getPreferences(user.sub);
  }

  @Put('preferences')
  updatePreferences(@CurrentUser() user: JwtPayload, @Body() dto: UpdatePreferencesDto) {
    return this.profileService.updatePreferences(user.sub, dto);
  }

  @Delete('account')
  @HttpCode(HttpStatus.OK)
  deleteAccount(@CurrentUser() user: JwtPayload, @Body() dto: DeleteAccountDto) {
    return this.profileService.deleteAccount(user.sub, dto);
  }
}

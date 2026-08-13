import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  @MaxLength(255)
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;
}

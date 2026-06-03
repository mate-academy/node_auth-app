import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsStrongPassword } from 'src/common/validators/is-strong-password.decorator';
import { MatchField } from 'src/common/validators/match-field.validator';

export class DataForUpdateNameDto {
  @IsString()
  @IsNotEmpty()
  newName!: string;
}

export class DataForUpdateEmailDto {
  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsEmail({}, { message: 'Invalid email address' })
  newEmail!: string;

  @IsEmail({}, { message: 'Invalid email address' })
  @MatchField('newEmail', { message: 'Emails do not match' })
  confirmNewEmail!: string;
}

export class DataForActivateNewEmailDto {
  @IsString()
  @IsNotEmpty()
  newName!: string;
}

export class DataForUpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  newPassword!: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  @MatchField('newPassword', { message: 'Passwords do not match' })
  confirmNewPassword!: string;
}

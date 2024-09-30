import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'

export class ChangePasswordDto {
  @IsString()
  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'the old password must have a Uppercase, lowercase letter and a number',
  })
  oldPassword: string

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'the new password must have a Uppercase, lowercase letter and a number',
  })
  newPassword: string
}

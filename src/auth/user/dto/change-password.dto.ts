import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class ChangePasswordDto {
  @IsString()
  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'La contraseña anterior debe tener una letra mayúscula, una minúscula y un número',
  })
  oldPassword: string

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'La nueva contraseña debe tener una letra mayúscula, una minúscula y un número',
  })
  newPassword: string
}

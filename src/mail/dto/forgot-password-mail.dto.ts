import { IsEmail, IsString, IsUrl, Length, MinLength } from 'class-validator'

export class ForgotPasswordMailDto {
  @IsString()
  @IsEmail()
  email: string

  @IsString()
  @MinLength(1)
  names: string

  @IsString()
  @Length(6, 6, { message: 'El código debe tener 6 caracteres' })
  code: string

  @IsString()
  @IsUrl()
  url: string
}

import { IsEmail, IsString, IsUrl, Length, MinLength } from 'class-validator'

export class ForgotPasswordMailDto {
  @IsString()
  @IsEmail()
  email: string

  @IsString()
  @MinLength(1)
  nombres: string

  @IsString()
  @Length(6, 6, { message: 'El código debe tener 6 caracteres.' })
  codigo: string

  @IsString()
  @IsUrl()
  url: string
}

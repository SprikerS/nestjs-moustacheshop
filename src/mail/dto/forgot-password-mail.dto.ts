import { IsEmail, IsString, IsUrl, Length, MinLength } from 'class-validator'

export class ForgotPasswordMailDto {
  @IsString()
  @IsEmail()
  email: string

  @IsString()
  @MinLength(1)
  names: string

  @IsString()
  @Length(6, 6, { message: 'the code must be 6 characters long' })
  code: string

  @IsString()
  @IsUrl()
  url: string
}

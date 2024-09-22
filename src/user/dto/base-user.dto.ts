import { IsString, Length, MinLength } from 'class-validator'

export class BaseUserDto {
  @IsString()
  @MinLength(1)
  names: string

  @IsString()
  @MinLength(1)
  paternalSurname: string

  @IsString()
  @MinLength(1)
  maternalSurname: string

  @IsString()
  @Length(8, 8, { message: 'the dni must have 8 digits' })
  dni: string
}

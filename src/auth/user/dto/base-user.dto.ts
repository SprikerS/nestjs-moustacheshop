import { IsString, Length, MinLength } from 'class-validator'

export class BaseUserDto {
  @IsString()
  @MinLength(1)
  nombres: string

  @IsString()
  @MinLength(1)
  apellidoPaterno: string

  @IsString()
  @MinLength(1)
  apellidoMaterno: string

  @IsString()
  @Length(8, 8, { message: 'the dni must have 8 digits' })
  dni: string
}

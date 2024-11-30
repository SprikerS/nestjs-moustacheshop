import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

import { ValidRoles } from '../../../auth/interfaces'
import { BaseUserDto } from './base-user.dto'

export class CreateUserDto extends BaseUserDto {
  @IsString()
  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'the password must have a Uppercase, lowercase letter and a number',
  })
  password: string

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(900000000, { message: 'the phone number must have 9 digits' })
  @Max(999999999, { message: 'the phone number must have 9 digits' })
  phoneNumber: number

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(ValidRoles, { each: true, message: 'each role must be a valid role' })
  roles: ValidRoles[]

  @IsOptional()
  @IsBoolean()
  active: boolean
}

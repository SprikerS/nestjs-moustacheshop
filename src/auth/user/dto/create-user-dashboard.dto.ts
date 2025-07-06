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
  Max,
  Min,
} from 'class-validator'

import { ValidRoles } from '../../interfaces'
import { BaseUserDto } from './base-user.dto'

export class CreateUserDashboardDto extends BaseUserDto {
  @IsString()
  @IsEmail()
  email: string

  @IsInt()
  @IsPositive()
  @Min(900000000, { message: 'the phone number must have 9 digits' })
  @Max(999999999, { message: 'the phone number must have 9 digits' })
  phoneNumber: number

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(ValidRoles, { each: true, message: 'each role must be a valid role' })
  roles: ValidRoles[]

  @IsOptional()
  @IsBoolean()
  active: boolean
}

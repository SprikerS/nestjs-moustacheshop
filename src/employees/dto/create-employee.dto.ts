import {
  IsEmail,
  IsInt,
  IsPositive,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

export class CreateEmployeeDto {
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

  @IsString()
  @Length(8, 8, { message: 'the dni must have 8 digits' })
  dni: string

  @IsInt()
  @IsPositive()
  @Min(900000000, { message: 'the phone number must have 9 digits' })
  @Max(999999999, { message: 'the phone number must have 9 digits' })
  phoneNumber: number
}

import { IsString, Length } from 'class-validator'

export class CreateCustomerDto {
  @IsString()
  @Length(8, 8, { message: 'the dni must have 8 digits' })
  dni: string
}

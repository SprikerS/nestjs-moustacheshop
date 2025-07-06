import { IsInt, IsPositive, IsString, Max, Min } from 'class-validator'

export class VerifyAccountDto {
  @IsInt()
  @IsPositive()
  @Min(100000)
  @Max(999999)
  code: number

  @IsString()
  token: string
}

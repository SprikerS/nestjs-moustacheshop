import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  name: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  description: string
}

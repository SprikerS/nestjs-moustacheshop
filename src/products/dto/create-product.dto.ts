import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator'

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  name: string

  @IsNumber()
  @IsPositive()
  price: number

  @IsInt()
  @IsPositive()
  stock: number

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  description: string

  @IsOptional()
  @IsUUID()
  categoryId: string
}

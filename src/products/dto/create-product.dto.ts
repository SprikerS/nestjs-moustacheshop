import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator'

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  nombre: string

  @IsNumber()
  @IsPositive()
  precio: number

  @IsInt()
  @IsPositive()
  stock: number

  @IsOptional()
  @IsString()
  @MaxLength(50)
  descripcion: string

  @IsOptional()
  @IsUUID()
  @ValidateIf(o => o.categoriaId !== null)
  categoriaId: string

  @IsOptional()
  @IsBoolean()
  activo: boolean
}

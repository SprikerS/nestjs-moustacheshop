import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsOptional, IsPositive, IsString, Min } from 'class-validator'

export class PaginationDto {
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  active?: boolean

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number

  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number
}

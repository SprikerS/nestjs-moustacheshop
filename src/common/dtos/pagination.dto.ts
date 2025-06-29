import { Type } from 'class-transformer'
import { IsOptional, IsPositive, IsString, Min } from 'class-validator'

export class PaginationDto {
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number

  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number
}

import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'

import { PaginationDto } from '../../common/dtos/pagination.dto'

export class PaginationProductDto extends PaginationDto {
  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  active?: boolean
}

import { IsOptional, IsString } from 'class-validator'

import { PaginationDto } from '../../common/dtos/pagination.dto'

export class PaginationProductDto extends PaginationDto {
  @IsOptional()
  @IsString()
  category?: string
}

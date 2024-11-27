import { IsArray, IsDateString, IsOptional, IsUUID } from 'class-validator'

import { BaseUserDto } from '../../auth/user/dto'
import { CreateOrderDetailDto } from './create-order-detail.dto'

export class CreateOrderDto extends BaseUserDto {
  @IsDateString()
  orderDate: Date

  @IsOptional()
  @IsUUID()
  customerId: string

  @IsArray()
  products: CreateOrderDetailDto[]
}

import { IsArray, IsDateString, IsUUID } from 'class-validator'
import { CreateOrderDetailDto } from './create-order-detail.dto'

export class CreateOrderDto {
  @IsDateString()
  orderDate: Date

  @IsUUID()
  customerId: string

  @IsArray()
  products: CreateOrderDetailDto[]
}

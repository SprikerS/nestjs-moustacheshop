import { IsArray, IsDateString, IsUUID } from 'class-validator'

import { CreateOrderDetailDto } from 'src/order-details/dto/create-order-detail.dto'

export class CreateOrderDto {
  @IsDateString()
  orderDate: Date

  @IsUUID()
  employeeId: string

  @IsUUID()
  customerId: string

  @IsArray()
  products: CreateOrderDetailDto[]
}

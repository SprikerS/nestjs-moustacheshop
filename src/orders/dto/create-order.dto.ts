import { IsArray, IsDateString, IsUUID } from 'class-validator'

import { CreateSaleDto } from 'src/sales/dto/create-sale.dto'

export class CreateOrderDto {
  @IsDateString()
  orderDate: Date

  @IsUUID()
  employeeId: string

  @IsUUID()
  customerId: string

  @IsArray()
  products: CreateSaleDto[]
}

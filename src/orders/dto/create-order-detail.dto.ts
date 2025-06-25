import { IsNumber, IsPositive, IsUUID } from 'class-validator'

export class CreateOrderDetailDto {
  @IsNumber()
  @IsPositive()
  quantity: number

  @IsUUID()
  productId: string

  @IsUUID()
  orderId: string
}

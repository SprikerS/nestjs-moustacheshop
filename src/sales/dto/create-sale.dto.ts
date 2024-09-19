import { IsNumber, IsPositive, IsUUID } from 'class-validator'

export class CreateSaleDto {
  @IsNumber()
  @IsPositive()
  quantity: number

  @IsUUID()
  productId: string

  @IsUUID()
  orderId: string
}

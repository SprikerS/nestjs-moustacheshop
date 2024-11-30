import { IsNumber, IsPositive, IsUUID } from 'class-validator'

export class CreateOrderDetailDto {
  @IsNumber()
  @IsPositive()
  cantidad: number

  @IsUUID()
  productoId: string

  @IsUUID()
  ordenId: string
}

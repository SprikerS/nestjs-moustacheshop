import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { OrderDetail } from './entities/order-detail.entity'

@Module({
  imports: [TypeOrmModule.forFeature([OrderDetail])],
  exports: [TypeOrmModule],
})
export class OrderDetailsModule {}

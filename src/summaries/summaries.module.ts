import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Order } from '../orders/entities/order.entity'
import { Product } from '../products/entities/product.entity'
import { SummariesController } from './summaries.controller'
import { SummariesService } from './summaries.service'
import { User } from '../auth/user/entities/user.entity'

@Module({
  controllers: [SummariesController],
  providers: [SummariesService],
  imports: [TypeOrmModule.forFeature([Product, User, Order])],
  exports: [TypeOrmModule],
})
export class SummariesModule {}

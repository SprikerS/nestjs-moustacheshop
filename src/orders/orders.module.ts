import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from '../auth/auth.module'
import { Order, OrderDetail } from './entities'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'
import { ProductsModule } from '../products/products.module'
import { User } from '../auth/user/entities'

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [AuthModule, ProductsModule, TypeOrmModule.forFeature([Order, OrderDetail, User])],
  exports: [OrdersService, TypeOrmModule],
})
export class OrdersModule {}

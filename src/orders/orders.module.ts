import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Order } from './entities/order.entity'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'

import { OrderDetailsModule } from 'src/order-details/order-details.module'
import { ProductsModule } from 'src/products/products.module'
import { UserModule } from 'src/user/user.module'

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    TypeOrmModule.forFeature([Order]),
    OrderDetailsModule,
    ProductsModule,
    UserModule,
  ],
  exports: [OrdersService, TypeOrmModule],
})
export class OrdersModule {}

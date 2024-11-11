import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from '../auth/auth.module'
import { ProductsModule } from '../products/products.module'
import { Order, OrderDetail } from './entities'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    AuthModule,
    ProductsModule,
    TypeOrmModule.forFeature([Order, OrderDetail]),
  ],
  exports: [OrdersService, TypeOrmModule],
})
export class OrdersModule {}

import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Order } from './entities/order.entity'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'

import { CustomersModule } from 'src/customers/customers.module'
import { EmployeesModule } from 'src/employees/employees.module'
import { OrderDetailsModule } from 'src/order-details/order-details.module'
import { ProductsModule } from 'src/products/products.module'

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    TypeOrmModule.forFeature([Order]),
    CustomersModule,
    EmployeesModule,
    ProductsModule,
    OrderDetailsModule,
  ],
  exports: [OrdersService, TypeOrmModule],
})
export class OrdersModule {}

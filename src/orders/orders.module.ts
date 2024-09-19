import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Order } from './entities/order.entity'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'

import { CustomersModule } from 'src/customers/customers.module'
import { EmployeesModule } from 'src/employees/employees.module'
import { ProductsModule } from 'src/products/products.module'
import { SalesModule } from 'src/sales/sales.module'

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    TypeOrmModule.forFeature([Order]),
    CustomersModule,
    EmployeesModule,
    ProductsModule,
    SalesModule,
  ],
})
export class OrdersModule {}

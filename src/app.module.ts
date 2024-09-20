import { Module } from '@nestjs/common'

import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { CommonModule } from './common/common.module'
import { CustomersModule } from './customers/customers.module'
import { EmployeesModule } from './employees/employees.module'
import { OrderDetailsModule } from './order-details/order-details.module'
import { OrdersModule } from './orders/orders.module'
import { ProductsModule } from './products/products.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [],
      autoLoadEntities: true,
      synchronize: true,
    }),
    CommonModule,
    CustomersModule,
    EmployeesModule,
    OrderDetailsModule,
    OrdersModule,
    ProductsModule,
  ],
})
export class AppModule {}

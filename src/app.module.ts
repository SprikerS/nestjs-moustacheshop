import { Module } from '@nestjs/common'

import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from './auth/auth.module'
import { CategoriesModule } from './categories/categories.module'
import { CommonModule } from './common/common.module'
import { MailModule } from './mail/mail.module'
import { OrdersModule } from './orders/orders.module'
import { PrinterModule } from './printer/printer.module'
import { ProductsModule } from './products/products.module'
import { StoreReportsModule } from './store-reports/store-reports.module'
import { SummariesModule } from './summaries/summaries.module'

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
    AuthModule,
    CategoriesModule,
    CommonModule,
    MailModule,
    OrdersModule,
    PrinterModule,
    ProductsModule,
    StoreReportsModule,
    SummariesModule,
  ],
})
export class AppModule {}

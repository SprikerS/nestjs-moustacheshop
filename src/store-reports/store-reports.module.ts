import { Module } from '@nestjs/common'

import { StoreReportsController } from './store-reports.controller'
import { StoreReportsService } from './store-reports.service'

import { OrdersModule } from '../orders/orders.module'
import { PrinterModule } from '../printer/printer.module'

@Module({
  controllers: [StoreReportsController],
  providers: [StoreReportsService],
  imports: [PrinterModule, OrdersModule],
})
export class StoreReportsModule {}

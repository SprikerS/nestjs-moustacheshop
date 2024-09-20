import { Injectable } from '@nestjs/common'
import { OrdersService } from 'src/orders/orders.service'

import { PrinterService } from 'src/printer/printer.service'
import { orderByIDReport } from 'src/reports'

@Injectable()
export class StoreReportsService {
  constructor(
    private readonly printerService: PrinterService,
    private readonly ordersService: OrdersService,
  ) {}

  async getOrderByIdReport(id: string) {
    const order = await this.ordersService.findOne(id)

    const docDefinition = orderByIDReport(order)
    const doc = this.printerService.createPdf(docDefinition)
    doc.info.Title = `${order.customer.dni} - BILL #${id.split('-')[0].toUpperCase()}`
    return doc
  }
}

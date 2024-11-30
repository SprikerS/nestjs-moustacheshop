import { Injectable } from '@nestjs/common'

import { OrdersService } from '../orders/orders.service'
import { PrinterService } from '../printer/printer.service'
import { orderByIDReport } from '../reports'

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
    doc.info.Title = `${order.cliente.dni} - BILL #${id.split('-')[0].toUpperCase()}`
    return doc
  }
}

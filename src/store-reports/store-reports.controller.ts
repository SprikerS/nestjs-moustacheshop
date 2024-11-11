import { Controller, Get, Param, ParseUUIDPipe, Res } from '@nestjs/common'
import { Response } from 'express'

import { StoreReportsService } from './store-reports.service'

@Controller('reports')
export class StoreReportsController {
  constructor(private readonly storeReportsService: StoreReportsService) {}

  @Get(':id')
  async getOrderReport(
    @Res() response: Response,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const pdfDoc = await this.storeReportsService.getOrderByIdReport(id)

    ;(response as any).setHeader('Content-Type', 'application/pdf')
    pdfDoc.pipe(response as any)
    pdfDoc.end()
  }
}

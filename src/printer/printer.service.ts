import * as path from 'path'

import { Injectable } from '@nestjs/common'

import PdfPrinter from 'pdfmake'
import { BufferOptions, CustomTableLayout, TDocumentDefinitions } from 'pdfmake/interfaces'

const fontsPath = path.join(__dirname, '..', 'assets', 'fonts')

const fonts = {
  Roboto: {
    bold: path.join(fontsPath, 'Roboto-Medium.ttf'),
    bolditalics: path.join(fontsPath, 'Roboto-MediumItalic.ttf'),
    italics: path.join(fontsPath, 'Roboto-Italic.ttf'),
    normal: path.join(fontsPath, 'Roboto-Regular.ttf'),
  },
}

const customTableLayouts: Record<string, CustomTableLayout> = {
  customLayout01: {
    hLineWidth: function (i, node) {
      if (i === 0 || i === node.table.body.length) {
        return 0
      }
      return i === node.table.headerRows ? 2 : 1
    },
    vLineWidth: function () {
      return 0
    },
    hLineColor: function (i) {
      return i === 1 ? 'black' : '#bbbbbb'
    },
    paddingLeft: function (i) {
      return i === 0 ? 0 : 8
    },
    paddingRight: function (i, node) {
      return i === node.table.widths.length - 1 ? 0 : 8
    },
    fillColor: function (i, node) {
      if (i === 0) {
        return '#7b90be'
      }
      if (i === node.table.body.length - 1) {
        return '#acb3c1'
      }

      return i % 2 === 0 ? '#f3f3f3' : null
    },
  },
}

@Injectable()
export class PrinterService {
  private printer = new PdfPrinter(fonts)

  createPdf(
    docDefinition: TDocumentDefinitions,
    options: BufferOptions = {
      tableLayouts: customTableLayouts,
    },
  ): PDFKit.PDFDocument {
    return this.printer.createPdfKitDocument(docDefinition, options)
  }
}

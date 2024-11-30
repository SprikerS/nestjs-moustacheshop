import {
  Content,
  StyleDictionary,
  TDocumentDefinitions,
} from 'pdfmake/interfaces'

import { CurrencyFormatter } from '../common/helpers'
import { Order } from '../orders/entities'
import { footerSection } from './sections'

const logo: Content = {
  image: 'src/assets/tucan-banner.png',
  width: 120,
}

const styles: StyleDictionary = {
  h1: {
    fontSize: 20,
    bold: true,
    margin: [0, 5],
  },
  h2: {
    fontSize: 16,
    bold: true,
  },
  h3: {
    fontSize: 14,
    bold: true,
  },
}

export const orderByIDReport = ({
  id,
  fecha,
  cliente,
  detalles,
}: Order): TDocumentDefinitions => {
  const subTotal = detalles
    .reduce((acc, detail) => acc + detail.precioVenta * detail.cantidad, 0)
    .toFixed(2)

  const total = CurrencyFormatter.formatCurrency(parseFloat(subTotal) * 1.18)

  return {
    pageSize: 'A4',
    footer: footerSection,
    styles,
    content: [
      logo,

      // Linea de separación
      {
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: 5,
            x2: 515,
            y2: 5,
            lineWidth: 1,
          },
        ],
      },

      {
        text: 'Tienda Bigotes',
        style: 'h1',
      },

      // Dirección de la empresa columna #1
      {
        columns: [
          {
            text: [
              { text: '15 Montgomery St.\n', style: 'h3' },
              `San Francisco, CA 94104 \nBN: 123456789\n`,
              {
                link: 'https://tiengabigotes.vercel.app',
                text: 'https://tiengabigotes.com',
              },
            ],
          },
          {
            text: [
              {
                text: `BILL #${id.split('-')[0].toUpperCase()} \n`,
                style: 'h3',
              },
              `${fecha}\n`,
            ],
            alignment: 'right',
          },
        ],
      },

      // Código QR con la dirección
      {
        qr: 'https://tiengabigotes.vercel.app',
        fit: 100,
        alignment: 'right',
      },

      { text: '\n\n' },

      // Datos del cliente
      {
        text: [
          {
            text: 'Vendido a:\n',
            style: 'h3',
          },
          `${cliente.nombres} ${cliente.apellidoPaterno} ${cliente.apellidoMaterno} \nDNI: ${cliente.dni}`,
        ],
      },

      { text: '\n' },

      // Tabla con los datos del pedido
      {
        margin: [0, 20],
        table: {
          widths: [50, '*', 'auto', 'auto', 'auto'],
          headerRows: 1,
          body: [
            [
              { text: '#', alignment: 'center' },
              { text: 'PRODUCTO', margin: [10, 0] },
              { text: 'CANTIDAD', margin: [10, 0], alignment: 'center' },
              { text: 'PRECIO', margin: [20, 0], alignment: 'center' },
              { text: 'TOTAL', alignment: 'center' },
            ],
            ...detalles.map((order, index) => [
              { text: index + 1, alignment: 'center' },
              {
                text: order.producto.nombre,
                margin: [10, 0],
              },
              {
                text: order.cantidad.toString(),
                alignment: 'center',
              },
              {
                text: order.precioVenta.toString(),
                alignment: 'center',
              },
              {
                text: order.total.toString(),
                alignment: 'center',
              },
            ]),

            // Totales de la tabla
            [
              { text: '', border: [false, false, false, false] },
              { text: '', border: [false, false, false, false] },
              { text: '', border: [false, false, false, false] },
              { text: 'SUBTOTAL', alignment: 'center' },
              {
                text: subTotal,
                alignment: 'center',
              },
            ],
            [
              { text: '', border: [false, false, false, false] },
              { text: '', border: [false, false, false, false] },
              { text: '', border: [false, false, false, false] },
              { text: 'IGV 18%', alignment: 'center' },
              {
                text: (parseFloat(subTotal) * 0.18).toFixed(2),
                alignment: 'center',
              },
            ],
            [
              { text: '', border: [false, false, false, false] },
              { text: '', border: [false, false, false, false] },
              { text: '', border: [false, false, false, false] },
              {
                alignment: 'center',
                bold: true,
                color: 'white',
                fillColor: 'black',
                margin: [5, 5],
                text: 'GRAN TOTAL',
              },
              {
                alignment: 'center',
                bold: true,
                color: 'white',
                fillColor: 'black',
                margin: [5, 5],
                text: total,
              },
            ],
          ],
        },
      },
    ],
  }
}

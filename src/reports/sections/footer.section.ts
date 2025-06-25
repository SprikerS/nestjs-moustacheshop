import { Content, ContextPageSize } from 'pdfmake/interfaces'

export const footerSection = (currentPage: number, pageCount: number, pageSize: ContextPageSize): Content => {
  return {
    text: `Page ${currentPage} of ${pageCount}`,
    alignment: 'right',
    fontSize: 12,
    bold: true,
    margin: [0, 10, 20, 0],
  }
}

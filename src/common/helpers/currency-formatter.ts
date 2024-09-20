export class CurrencyFormatter {
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PEN',
    }).format(value)
  }
}

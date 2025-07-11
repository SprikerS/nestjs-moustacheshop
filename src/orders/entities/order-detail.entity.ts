import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { ColumnNumericTransformer } from '../../common/helpers'
import { Product } from '../../products/entities/product.entity'
import { Order } from './order.entity'

@Entity({ name: 'order_details' })
export class OrderDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('int')
  quantity: number

  @Column('decimal', {
    name: 'sale_price',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  salePrice: number

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  total: number

  @ManyToOne(() => Product, product => product.details)
  @JoinColumn({ name: 'product_id' })
  product: Product

  @ManyToOne(() => Order, order => order.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order

  @BeforeInsert()
  @BeforeUpdate()
  calculateTotal() {
    this.total = parseFloat((this.quantity * this.salePrice).toFixed(2))
  }
}

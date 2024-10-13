import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { ColumnNumericTransformer } from 'src/common/helpers'
import { Product } from 'src/products/entities/product.entity'
import { Order } from './order.entity'

@Entity({ name: 'order_details' })
export class OrderDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('int')
  quantity: number

  @Column('decimal', {
    name: 'sale_price',
    precision: 5,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  salePrice: number

  @Column('decimal', {
    precision: 5,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  total: number

  @ManyToOne(() => Product, product => product.details)
  product: Product

  @ManyToOne(() => Order, order => order.details, { onDelete: 'CASCADE' })
  order: Order

  @BeforeInsert()
  @BeforeUpdate()
  calculateTotal() {
    this.total = parseFloat((this.quantity * this.salePrice).toFixed(2))
  }
}

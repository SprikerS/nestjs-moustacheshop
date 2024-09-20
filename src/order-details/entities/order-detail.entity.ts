import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { Order } from 'src/orders/entities/order.entity'
import { Product } from 'src/products/entities/product.entity'

@Entity({ name: 'order_details' })
export class OrderDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('int')
  quantity: number

  @Column('decimal', { precision: 5, scale: 2, name: 'sale_price' })
  salePrice: number

  @Column('decimal', { precision: 5, scale: 2 })
  total: number

  @ManyToOne(() => Product, product => product.details)
  product: Product

  @ManyToOne(() => Order, order => order.details)
  order: Order

  @BeforeInsert()
  @BeforeUpdate()
  calculateTotal() {
    this.total = parseFloat((this.quantity * this.salePrice).toFixed(2))
  }
}
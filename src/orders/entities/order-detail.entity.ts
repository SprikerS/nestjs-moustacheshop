import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity, JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

import { ColumnNumericTransformer } from '../../common/helpers'
import { Product } from '../../products/entities/product.entity'
import { Order } from './order.entity'

@Entity({ name: 'orden_detalles' })
export class OrderDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('int')
  cantidad: number

  @Column('decimal', {
    name: 'precio_venta',
    precision: 5,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  precioVenta: number

  @Column('decimal', {
    precision: 5,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  total: number

  @ManyToOne(() => Product, product => product.detalles)
  @JoinColumn({ name: 'producto_id' })
  producto: Product

  @ManyToOne(() => Order, order => order.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orden_id' })
  orden: Order

  @BeforeInsert()
  @BeforeUpdate()
  calculateTotal() {
    this.total = parseFloat((this.cantidad * this.precioVenta).toFixed(2))
  }
}

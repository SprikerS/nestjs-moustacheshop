import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Product } from 'src/products/entities/product.entity'

@Entity()
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('int')
  quantity: number

  @Column('decimal', { precision: 5, scale: 2 })
  salePrice: number

  @Column('decimal', { precision: 5, scale: 2 })
  total: number

  @ManyToOne(() => Product, product => product.sales)
  product: Product

  @BeforeInsert()
  @BeforeUpdate()
  calculateTotal() {
    this.total = parseFloat((this.quantity * this.salePrice).toFixed(2))
  }
}

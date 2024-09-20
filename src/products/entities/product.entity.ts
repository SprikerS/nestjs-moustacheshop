import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { OrderDetail } from 'src/order-details/entities/order-detail.entity'

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text', { unique: true })
  name: string

  @Column('decimal', { precision: 5, scale: 2 })
  price: number

  @Column('int')
  stock: number

  @OneToMany(() => OrderDetail, detail => detail.product)
  details?: OrderDetail[]
}

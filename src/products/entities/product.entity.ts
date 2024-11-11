import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { ColumnNumericTransformer } from '../../common/helpers'
import { OrderDetail } from '../../orders/entities'

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text', { unique: true })
  name: string

  @Column('decimal', {
    precision: 5,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  price: number

  @Column('int')
  stock: number

  @OneToMany(() => OrderDetail, detail => detail.product)
  details?: OrderDetail[]
}

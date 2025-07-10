import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { Category } from '../../categories/entities/category.entity'
import { ColumnNumericTransformer } from '../../common/helpers'
import { OrderDetail } from '../../orders/entities'

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text', { unique: true })
  name: string

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  price: number

  @Column('int')
  stock: number

  @Column('text', { nullable: true })
  description: string

  @Column('boolean', { default: true })
  active: boolean

  @ManyToOne(() => Category, category => category.products, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category

  @OneToMany(() => OrderDetail, detail => detail.product)
  details?: OrderDetail[]
}

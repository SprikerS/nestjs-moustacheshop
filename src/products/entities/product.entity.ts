import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { Category } from '../../categories/entities/category.entity'
import { ColumnNumericTransformer } from '../../common/helpers'
import { OrderDetail } from '../../orders/entities'

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text', { unique: true })
  nombre: string

  @Column('decimal', {
    precision: 5,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  precio: number

  @Column('int')
  stock: number

  @Column('text', { nullable: true })
  descripcion: string

  @Column('boolean', { default: true })
  activo: boolean

  @ManyToOne(() => Category, category => category.productos, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Category

  @OneToMany(() => OrderDetail, detail => detail.product)
  detalles?: OrderDetail[]
}

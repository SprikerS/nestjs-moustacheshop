import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { Product } from '../../products/entities/product.entity'

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text', { unique: true })
  nombre: string

  @OneToMany(() => Product, product => product.categoria, {
    cascade: false,
  })
  productos?: Product[]
}

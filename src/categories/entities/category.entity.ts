import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { Product } from '../../products/entities/product.entity'

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text', { unique: true })
  name: string

  @Column('text', { nullable: true })
  description: string

  @OneToMany(() => Product, product => product.category, {
    cascade: false,
  })
  products?: Product[]
}

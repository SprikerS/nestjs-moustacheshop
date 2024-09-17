import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

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
}

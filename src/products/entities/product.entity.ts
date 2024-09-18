import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Sale } from 'src/sales/entities/sale.entity'

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

  @OneToMany(() => Sale, sale => sale.product, { cascade: true })
  sales?: Sale[]
}

import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { User } from '../../auth/user/entities'
import { OrderDetail } from './order-detail.entity'

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('date')
  fecha: Date

  @OneToMany(() => OrderDetail, detail => detail.orden)
  detalles?: OrderDetail[]

  @ManyToOne(() => User, user => user.ventas)
  empleado: User

  @ManyToOne(() => User, user => user.compras)
  cliente: User
}

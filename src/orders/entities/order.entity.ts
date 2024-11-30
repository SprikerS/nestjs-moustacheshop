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

  @Column('date', { name: 'order_date' })
  orderDate: Date

  @OneToMany(() => OrderDetail, detail => detail.order)
  details?: OrderDetail[]

  @ManyToOne(() => User, user => user.ventas)
  employee: User

  @ManyToOne(() => User, user => user.compras)
  customer: User
}

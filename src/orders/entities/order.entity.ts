import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { User } from 'src/auth/user/entities/user.entity'
import { OrderDetail } from './order-detail.entity'

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('date', { name: 'order_date' })
  orderDate: Date

  @OneToMany(() => OrderDetail, detail => detail.order)
  details?: OrderDetail[]

  @ManyToOne(() => User, user => user.sales)
  employee: User

  @ManyToOne(() => User, user => user.purchases)
  customer: User
}

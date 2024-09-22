import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { OrderDetail } from 'src/order-details/entities/order-detail.entity'
import { User } from 'src/user/entities/user.entity'

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

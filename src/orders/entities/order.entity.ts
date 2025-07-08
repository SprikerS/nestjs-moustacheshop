import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { User } from '../../auth/user/entities'
import { OrderDetail } from './order-detail.entity'

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'timestamp with time zone' })
  date: Date

  @OneToMany(() => OrderDetail, detail => detail.order)
  details?: OrderDetail[]

  @ManyToOne(() => User, user => user.sales)
  @JoinColumn({ name: 'employee_id' })
  employee: User

  @ManyToOne(() => User, user => user.purchases)
  @JoinColumn({ name: 'customer_id' })
  customer: User
}

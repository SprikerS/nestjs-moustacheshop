import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { Customer } from 'src/customers/entities/customer.entity'
import { Employee } from 'src/employees/entities/employee.entity'
import { OrderDetail } from 'src/order-details/entities/order-detail.entity'

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('date', { name: 'order_date' })
  orderDate: Date

  @OneToMany(() => OrderDetail, detail => detail.order)
  details?: OrderDetail[]

  @ManyToOne(() => Employee, employee => employee.orders)
  employee: Employee

  @ManyToOne(() => Customer, customer => customer.orders)
  customer: Customer
}

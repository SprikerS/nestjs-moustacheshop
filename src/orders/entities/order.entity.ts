import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { Customer } from 'src/customers/entities/customer.entity'
import { Employee } from 'src/employees/entities/employee.entity'
import { Sale } from 'src/sales/entities/sale.entity'

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('date', { name: 'order_date' })
  orderDate: Date

  @OneToMany(() => Sale, sale => sale.order)
  sales?: Sale[]

  @ManyToOne(() => Employee, employee => employee.orders)
  employee: Employee

  @ManyToOne(() => Customer, customer => customer.orders)
  customer: Customer
}

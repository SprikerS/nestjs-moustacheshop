import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { capitalizeEachWord } from 'src/common/helpers'
import { Order } from 'src/orders/entities/order.entity'

@Entity()
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text')
  names: string

  @Column('text', { name: 'paternal_surname' })
  paternalSurname: string

  @Column('text', { name: 'maternal_surname' })
  maternalSurname: string

  @Column('text', { unique: true })
  email: string

  @Column('text', { select: false })
  password: string

  @Column('text', { unique: true })
  dni: string

  @Column('int', { unique: true, name: 'phone_number' })
  phoneNumber: number

  @Column('bool', { default: true, name: 'is_active' })
  isActive: boolean

  @OneToMany(() => Order, order => order.employee)
  orders?: Order[]

  @BeforeInsert()
  @BeforeUpdate()
  checkFields() {
    this.email = this.email.toLowerCase().trim()
    this.names = capitalizeEachWord(this.names)
    this.paternalSurname = capitalizeEachWord(this.paternalSurname)
    this.maternalSurname = capitalizeEachWord(this.maternalSurname)
  }
}

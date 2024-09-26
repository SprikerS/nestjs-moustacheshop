import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { ValidRoles } from 'src/auth/interfaces'
import { capitalizeEachWord } from 'src/common/helpers'
import { Order } from 'src/orders/entities/order.entity'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text')
  names: string

  @Column('text', { name: 'paternal_surname' })
  paternalSurname: string

  @Column('text', { name: 'maternal_surname' })
  maternalSurname: string

  @Column('text', { unique: true })
  dni: string

  @Column('text', { unique: true, nullable: true })
  email?: string

  @Column('text', { select: false, nullable: true })
  password?: string

  @Column('int', { unique: true, name: 'phone_number', nullable: true })
  phoneNumber?: number

  @Column('bool', { default: true, name: 'is_active' })
  isActive: boolean

  @Column('text', { array: true, default: [ValidRoles.CUSTOMER] })
  roles: string[]

  @OneToMany(() => Order, order => order.employee)
  sales?: Order[]

  @OneToMany(() => Order, order => order.customer)
  purchases?: Order[]

  @BeforeInsert()
  @BeforeUpdate()
  checkFields() {
    this.email = this.email?.toLowerCase().trim()
    this.names = capitalizeEachWord(this.names)
    this.paternalSurname = capitalizeEachWord(this.paternalSurname)
    this.maternalSurname = capitalizeEachWord(this.maternalSurname)
  }
}

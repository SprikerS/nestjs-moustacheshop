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
export class Customer {
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

  @OneToMany(() => Order, order => order.customer)
  orders?: Order[]

  @BeforeInsert()
  @BeforeUpdate()
  checkFields() {
    this.names = capitalizeEachWord(this.names)
    this.paternalSurname = capitalizeEachWord(this.paternalSurname)
    this.maternalSurname = capitalizeEachWord(this.maternalSurname)
  }
}

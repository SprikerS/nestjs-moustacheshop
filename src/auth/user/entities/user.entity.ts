import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'

import { ValidRoles } from '../../interfaces'
import { capitalizeEachWord } from '../../../common/helpers'
import { Order } from '../../../orders/entities'
import { PasswordRecovery } from './password.recovery'
import { VerifyAccount } from './verify.account'

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

  @Column('bool', { default: true })
  active: boolean

  @Column('bool', { default: false })
  verified: boolean

  @Column('text', { array: true, default: [ValidRoles.CUSTOMER] })
  roles: string[]

  @OneToMany(() => Order, order => order.employee)
  sales?: Order[]

  @OneToMany(() => Order, order => order.customer)
  purchases?: Order[]

  @OneToOne(() => PasswordRecovery, pass => pass.user)
  pwdRec?: PasswordRecovery

  @OneToOne(() => VerifyAccount, verify => verify.user)
  verifyAccount?: VerifyAccount

  @BeforeInsert()
  @BeforeUpdate()
  checkFields() {
    this.email = this.email?.toLowerCase().trim()
    this.names = capitalizeEachWord(this.names)
    this.paternalSurname = capitalizeEachWord(this.paternalSurname)
    this.maternalSurname = capitalizeEachWord(this.maternalSurname)
  }
}

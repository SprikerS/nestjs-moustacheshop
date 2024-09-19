import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { capitalizeEachWord } from 'src/helpers/string.helper'

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

  @BeforeInsert()
  @BeforeUpdate()
  checkFields() {
    this.email = this.email.toLowerCase().trim()
    this.names = capitalizeEachWord(this.names)
    this.paternalSurname = capitalizeEachWord(this.paternalSurname)
    this.maternalSurname = capitalizeEachWord(this.maternalSurname)
  }
}

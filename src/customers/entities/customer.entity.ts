import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { capitalizeEachWord } from 'src/helpers/string.helper'

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

  @BeforeInsert()
  @BeforeUpdate()
  checkFields() {
    this.names = capitalizeEachWord(this.names)
    this.paternalSurname = capitalizeEachWord(this.paternalSurname)
    this.maternalSurname = capitalizeEachWord(this.maternalSurname)
  }
}

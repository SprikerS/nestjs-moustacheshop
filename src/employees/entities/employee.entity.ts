import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text')
  names: string

  @Column('text')
  paternalSurname: string

  @Column('text')
  maternalSurname: string

  @Column('text', { unique: true })
  email: string

  @Column('text', { select: false })
  password: string

  @Column('text', { unique: true })
  dni: string

  @Column('int', { unique: true })
  phoneNumber: number

  @Column('bool', { default: true })
  isActive: boolean

  @BeforeInsert()
  @BeforeUpdate()
  checkFields() {
    this.email = this.email.toLowerCase().trim()
    this.names = this.capitalizeEachWord(this.names)
    this.paternalSurname = this.capitalizeEachWord(this.paternalSurname)
    this.maternalSurname = this.capitalizeEachWord(this.maternalSurname)
  }

  private capitalizeEachWord(value: string): string {
    return value
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
}

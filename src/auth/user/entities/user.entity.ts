import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { ValidRoles } from '../../interfaces'
import { capitalizeEachWord } from '../../../common/helpers'
import { Order } from '../../../orders/entities'
import { PasswordRecovery } from './password.recovery'

@Entity({ name: 'usuario' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text')
  nombres: string

  @Column('text', { name: 'apellido_paterno' })
  apellidoPaterno: string

  @Column('text', { name: 'apellido_materno' })
  apellidoMaterno: string

  @Column('text', { unique: true })
  dni: string

  @Column('text', { unique: true, nullable: true })
  email?: string

  @Column('text', { select: false, nullable: true })
  clave?: string

  @Column('int', { unique: true, name: 'telefono', nullable: true })
  telefono?: number

  @Column('bool', { default: true })
  activo: boolean

  @Column('text', { array: true, default: [ValidRoles.CUSTOMER] })
  roles: string[]

  @OneToMany(() => Order, order => order.empleado)
  ventas?: Order[]

  @OneToMany(() => Order, order => order.cliente)
  compras?: Order[]

  @OneToOne(() => PasswordRecovery, pass => pass.user, { onDelete: 'CASCADE' })
  pwdRec?: PasswordRecovery

  @BeforeInsert()
  @BeforeUpdate()
  checkFields() {
    this.email = this.email?.toLowerCase().trim()
    this.nombres = capitalizeEachWord(this.nombres)
    this.apellidoPaterno = capitalizeEachWord(this.apellidoPaterno)
    this.apellidoMaterno = capitalizeEachWord(this.apellidoMaterno)
  }
}

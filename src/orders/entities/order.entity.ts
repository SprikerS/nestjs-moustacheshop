import {
  Column,
  Entity, JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'

import { User } from '../../auth/user/entities'
import { OrderDetail } from './order-detail.entity'

@Entity({ name: 'orden' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('date')
  fecha: Date

  @OneToMany(() => OrderDetail, detail => detail.orden)
  detalles?: OrderDetail[]

  @ManyToOne(() => User, user => user.ventas)
  @JoinColumn({ name: 'empleado_id' })
  empleado: User

  @ManyToOne(() => User, user => user.compras)
  @JoinColumn({ name: 'cliente_id' })
  cliente: User
}

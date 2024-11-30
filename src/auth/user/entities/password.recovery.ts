import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { User } from './user.entity'

@Entity({ name: 'recuperar_clave' })
export class PasswordRecovery {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text')
  codigo: string

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp with time zone' })
  createdAt: Date

  @Column('timestamp with time zone', { name: 'expira_en' })
  expiresAt: Date

  @Column('bool', { default: false })
  usado: boolean

  @Column('text')
  jwt: string

  @OneToOne(() => User, user => user.pwdRec)
  @JoinColumn({ name : 'usuario_id' })
  user: User
}

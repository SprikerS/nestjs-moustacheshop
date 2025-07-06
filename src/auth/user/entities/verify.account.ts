import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'

import { User } from './user.entity'

@Entity()
export class VerifyAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text')
  code: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date

  @Column('timestamp with time zone', { name: 'expires_at' })
  expiresAt: Date

  @Column('bool', { default: false })
  used: boolean

  @Column('text')
  jwt: string

  @OneToOne(() => User, user => user.verifyAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User
}

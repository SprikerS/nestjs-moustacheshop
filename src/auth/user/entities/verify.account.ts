import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'

import { User } from './user.entity'

@Entity()
export class VerifyAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text')
  code: string

  @Column('text')
  token: string

  @OneToOne(() => User, user => user.verifyAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User
}

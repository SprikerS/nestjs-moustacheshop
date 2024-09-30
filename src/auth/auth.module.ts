import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'

import { MailModule } from 'src/mail/mail.module'
import { JwtStrategy } from './strategies/jwt.strategy'
import { UserController, UserService } from './user'
import { PasswordRecovery, User } from './user/entities'

@Module({
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
  imports: [
    ConfigModule,
    MailModule,
    TypeOrmModule.forFeature([User, PasswordRecovery]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: { expiresIn: '1d' },
        }
      },
    }),
  ],
  exports: [UserService, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}

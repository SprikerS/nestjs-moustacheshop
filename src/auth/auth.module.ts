import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'

import { JwtStrategy } from './strategies/jwt.strategy'
import { MailModule } from '../mail/mail.module'
import { PasswordRecovery, User, VerifyAccount } from './user/entities'
import { UserController } from './user/user.controller'
import { UserService } from './user/user.service'

@Module({
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
  imports: [
    ConfigModule,
    MailModule,
    TypeOrmModule.forFeature([User, PasswordRecovery, VerifyAccount]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: { expiresIn: configService.get('JWT_EXPIRATION') },
        }
      },
    }),
  ],
  exports: [UserService, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}

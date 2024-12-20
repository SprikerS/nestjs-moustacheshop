import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { InjectRepository } from '@nestjs/typeorm'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Repository } from 'typeorm'

import { JwtPayload } from '../interfaces'
import { User } from '../user/entities'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    })
  }

  async validate({ id }: JwtPayload): Promise<User> {
    const user = await this.userRepository.findOneBy({ id })

    if (!user) throw new UnauthorizedException('Token not valid')

    if (!user.activo)
      throw new UnauthorizedException('User is inactive, talk with an admin')

    return user
  }
}

import { ForbiddenException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { Response } from 'express'

import ms from 'ms'
import * as bcrypt from 'bcrypt'

import { PaginationDto } from '../../common/dtos/pagination.dto'
import { handleDBExceptions } from '../../common/helpers'
import { MailService } from '../../mail/mail.service'
import { JwtPayload, JwtPayloadForgotPassword } from '../interfaces'
import {
  ChangePasswordDto,
  CreateUserDto,
  ForgotPasswordDto,
  LoginUserDto,
  ResetPasswordDto,
  UpdateUserDto,
} from './dto'
import { PasswordRecovery, User } from './entities'
import { ResetPwdQuery } from './interfaces'
import { scrapingDNI } from './utils/scraping-dni'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(PasswordRecovery)
    private readonly pwdRecRepository: Repository<PasswordRecovery>,

    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private mapUserToJwtPayload(user: User): JwtPayload {
    return {
      id: user.id,
      names: user.names,
      paternalSurname: user.paternalSurname,
      maternalSurname: user.maternalSurname,
      dni: user.dni,
      email: user.email,
      phoneNumber: user.phoneNumber,
      active: user.active,
      roles: user.roles,
    }
  }

  private getJwtToken(user: User) {
    const payload = this.mapUserToJwtPayload(user)
    return this.jwtService.sign({ ...payload })
  }

  private getJwtForgotPasswordToken(payload: JwtPayloadForgotPassword) {
    return this.jwtService.sign(payload, { expiresIn: '15m' })
  }

  private async findUserByEmail(email: string, id: string | null = null) {
    const queryBuilder = this.userRepository.createQueryBuilder('qbUser')
    const user = await queryBuilder.addSelect('qbUser.password').where('qbUser.email =:email', { email }).getOne()

    if (!user) throw new NotFoundException(`User with email ${email} not found`)
    if (!id) return user

    if (user.id !== id) throw new ForbiddenException(`User with ID ${id} can't access this data`)

    return user
  }

  async changePassword({ id }: User, { email, oldPassword, newPassword }: ChangePasswordDto) {
    try {
      const user = await this.findUserByEmail(email, id)
      if (!bcrypt.compareSync(oldPassword, user.password)) throw new UnauthorizedException('Invalid old password')

      user.password = await bcrypt.hash(newPassword, 10)
      await this.userRepository.save(user)
      await this.mailService.notifyPasswordChange(user)
      delete user.password

      return {
        status: 'success',
        message: 'Password changed successfully',
        user,
      }
    } catch (error) {
      handleDBExceptions(this.logger, error)
    }
  }

  async forgotPassword({ email }: ForgotPasswordDto) {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const user = await this.findUserByEmail(email)

      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const jwt = this.getJwtForgotPasswordToken({ email, code })
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

      let recovery = await this.pwdRecRepository.findOne({
        where: { user },
        relations: { user: true },
      })

      if (!recovery) {
        recovery = this.pwdRecRepository.create({ code: code, jwt, user, expiresAt })
      } else {
        recovery.jwt = jwt
        recovery.code = code
        recovery.expiresAt = expiresAt
      }

      await queryRunner.manager.save(recovery)
      await this.mailService.sendForgotPasswordEmail(code, jwt, user)
      await queryRunner.commitTransaction()

      return {
        status: 'success',
        message: `Forgot password email sent to ${email}`,
        recovery,
      }
    } catch (error) {
      await queryRunner.rollbackTransaction()
      handleDBExceptions(this.logger, error)
    } finally {
      await queryRunner.release()
    }
  }

  async resetPassword({ token, code }: ResetPwdQuery, { password }: ResetPasswordDto) {
    if (!code && !token) throw new UnauthorizedException('Invalid token or code')
    if (code && code.length !== 6) throw new UnauthorizedException(`Length of code must be 6`)

    const queryBuilder = this.pwdRecRepository.createQueryBuilder('qbPWD')
    const pwdRec = await queryBuilder
      .leftJoinAndSelect('qbPWD.user', 'user')
      .addSelect('user.password')
      .where('qbPWD.code =:code OR qbPWD.jwt =:token', { code, token })
      .getOne()

    if (!pwdRec) throw new UnauthorizedException('Invalid code or token')
    if (code && pwdRec.expiresAt < new Date()) throw new UnauthorizedException('Your code or token has expired')

    try {
      if (token) this.jwtService.verify(token)

      const { user } = pwdRec
      user.password = await bcrypt.hash(password, 10)

      await this.userRepository.save(user)
      await this.pwdRecRepository.remove(pwdRec)
      await this.mailService.notifyPasswordChange(user)
      delete user.password

      return {
        status: 'success',
        message: 'Password reset successfully',
        user,
      }
    } catch (error) {
      handleDBExceptions(this.logger, error)
    }
  }

  async create(registerDto: CreateUserDto) {
    try {
      const { password, ...data } = registerDto
      const user = this.userRepository.create({
        password: await bcrypt.hash(password, 10),
        ...data,
      })

      await this.userRepository.save(user)
      delete user.password

      return {
        // ...user,
        token: this.getJwtToken(user),
      }
    } catch (error) {
      handleDBExceptions(this.logger, error)
    }
  }

  async login({ email, password }: LoginUserDto, response: Response) {
    const user = await this.findUserByEmail(email)

    if (!bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('Invalid credentials')
    delete user.password

    const token = this.getJwtToken(user)
    const expires = new Date()
    expires.setMilliseconds(expires.getMilliseconds() + ms(process.env.JWT_EXPIRATION as ms.StringValue))

    response.cookie('access_token', token, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      expires,
    })

    return {
      // ...user,
      token,
    }
  }

  async checkAuthStatus(user: User) {
    return {
      // ...user,
      token: this.getJwtToken(user),
    }
  }

  async srapingReniec(dni: string) {
    const userDB = await this.userRepository.findOneBy({ dni })
    if (userDB) {
      const { dni, names, paternalSurname, maternalSurname } = userDB

      return {
        dni,
        names,
        paternalSurname,
        maternalSurname,
      }
    }

    return await scrapingDNI(dni)
  }

  findAll({ limit = 20, offset = 0 }: PaginationDto) {
    return this.userRepository.find({
      take: limit,
      skip: offset,
      // where: { active: true },
    })
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { sales: true, purchases: true },
    })
    if (!user) throw new NotFoundException(`User with ID ${id} not found`)
    return user
  }

  async update(id: string, updateuserDto: UpdateUserDto) {
    const user = await this.userRepository.preload({
      id,
      ...updateuserDto,
    })

    if (!user) throw new NotFoundException(`User with id ${id} not found`)

    try {
      await this.userRepository.save(user)
      return user
    } catch (error) {
      handleDBExceptions(this.logger, error)
    }
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        sales: true,
        purchases: true,
      },
    })
    if (!user) throw new NotFoundException(`User with ID ${id} not found`)

    const hasRelations = (user.sales && user.sales.length > 0) || (user.purchases && user.purchases.length > 0)

    if (hasRelations) {
      user.active = false
      await this.userRepository.save(user)
    } else {
      await this.userRepository.remove(user)
    }
  }
}

import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'

import * as bcrypt from 'bcrypt'
import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { handleDBExceptions } from 'src/common/helpers'
import { MailService } from 'src/mail/mail.service'
import { JwtPayload, JwtPayloadForgotPassword } from '../interfaces'
import {
  BaseUserDto,
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

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload)
  }

  private getJwtForgotPasswordToken(payload: JwtPayloadForgotPassword) {
    return this.jwtService.sign(payload, { expiresIn: '15m' })
  }

  private async verifyAccessUser(email: string, id: string | null = null) {
    const queryBuilder = this.userRepository.createQueryBuilder('qbUser')
    const user = await queryBuilder
      .addSelect('qbUser.password')
      .where('qbUser.email =:email', { email })
      .getOne()

    if (!user) throw new NotFoundException(`User with email ${email} not found`)
    if (!id) return user

    if (user.id !== id)
      throw new ForbiddenException(`User with ID ${id} can't access this data`)

    return user
  }

  async changePassword(
    { id }: User,
    { email, oldPassword, newPassword }: ChangePasswordDto,
  ) {
    try {
      const user = await this.verifyAccessUser(email, id)
      if (!bcrypt.compareSync(oldPassword, user.password))
        throw new UnauthorizedException('Invalid old password')

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
      const user = await this.verifyAccessUser(email)

      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const jwt = this.getJwtForgotPasswordToken({ email, code })
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

      let recovery = await this.pwdRecRepository.findOne({
        where: { user },
        relations: { user: true },
      })

      if (!recovery) {
        recovery = this.pwdRecRepository.create({ code, jwt, user, expiresAt })
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

  async resetPassword(
    { token, code }: ResetPwdQuery,
    { password }: ResetPasswordDto,
  ) {
    if (!code && !token)
      throw new UnauthorizedException('Invalid token or code')
    if (code && code.length !== 6)
      throw new UnauthorizedException(`Length of code must be 6`)

    const queryBuilder = this.pwdRecRepository.createQueryBuilder('qbPWD')
    const pwdRec = await queryBuilder
      .leftJoinAndSelect('qbPWD.user', 'user')
      .addSelect('user.password')
      .where('qbPWD.code =:code OR qbPWD.jwt =:token', { code, token })
      .getOne()

    if (!pwdRec) throw new UnauthorizedException('Invalid code or token')
    if (code && pwdRec.expiresAt < new Date())
      throw new UnauthorizedException('Your code or token has expired')

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

  async create(registerDto: BaseUserDto | CreateUserDto) {
    try {
      let user: User

      if ('password' in registerDto) {
        const { password, ...data } = registerDto
        user = this.userRepository.create({
          password: await bcrypt.hash(password, 10),
          ...data,
        })
      } else {
        user = this.userRepository.create(registerDto)
      }

      await this.userRepository.save(user)
      delete user.password

      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      }
    } catch (error) {
      handleDBExceptions(this.logger, error)
    }
  }

  async login({ email, password }: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, password: true },
    })

    if (!user) throw new UnauthorizedException('Invalid credentials')

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Invalid credentials')

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    }
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    }
  }

  async mutationByDNI(dni: string, saved: boolean) {
    let user: User | BaseUserDto

    user = await this.userRepository.findOneBy({ dni })
    if (user) return user

    user = await scrapingDNI(dni)
    if (saved) user = await this.create(user)

    return user
  }

  findAll({ limit = 20, offset = 0 }: PaginationDto) {
    return this.userRepository.find({
      take: limit,
      skip: offset,
      where: { isActive: true },
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
    const user = await this.findOne(id)
    // user.isActive = false
    // await this.userRepository.save(person)
    await this.userRepository.remove(user)
  }
}

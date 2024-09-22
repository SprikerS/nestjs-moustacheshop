import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { handleDBExceptions } from 'src/common/helpers'
import { BaseUserDto, CreateUserDto, UpdateUserDto } from './dto'
import { User } from './entities/user.entity'
import { scrapingDNI } from './utils/scraping-dni'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: BaseUserDto | CreateUserDto) {
    try {
      const user = this.userRepository.create(createUserDto)
      await this.userRepository.save(user)
      delete user.password
      return user
    } catch (error) {
      handleDBExceptions(this.logger, error)
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

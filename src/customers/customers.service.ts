import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { handleDBExceptions } from 'src/common/helpers'
import { scrapingDNI } from './helpers/scraping-dni'

import { CreateCustomerDto } from './dto/create-customer.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'
import { Customer } from './entities/customer.entity'

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name)

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const { dni } = createCustomerDto

    await this.customerRepository.findOne({ where: { dni } }).then(customer => {
      if (customer)
        throw new BadRequestException(
          'the customer with this ID already exists.',
        )
    })

    const scrapingData = await scrapingDNI(dni)
    const customer = this.customerRepository.create({
      dni,
      ...scrapingData,
    })

    try {
      await this.customerRepository.save(customer)
      return customer
    } catch (error) {
      handleDBExceptions(this.logger, error)
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 20, offset = 0 } = paginationDto

    return this.customerRepository.find({
      take: limit,
      skip: offset,
    })
  }

  async findOne(id: string) {
    const customer = await this.customerRepository.findOneBy({ id })
    if (!customer)
      throw new NotFoundException(`Customer with ID ${id} not found`)
    return customer
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.customerRepository.preload({
      id,
      ...updateCustomerDto,
    })

    if (!customer)
      throw new NotFoundException(`Customer with id ${id} not found`)

    try {
      await this.customerRepository.save(customer)
      return customer
    } catch (error) {
      handleDBExceptions(this.logger, error)
    }
  }

  async remove(id: string) {
    const customer = await this.findOne(id)
    await this.customerRepository.remove(customer)
  }
}

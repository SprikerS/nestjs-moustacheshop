import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { PaginationDto } from 'src/common/dtos/pagination.dto'

import { CreateEmployeeDto } from './dto/create-employee.dto'
import { UpdateEmployeeDto } from './dto/update-employee.dto'
import { Employee } from './entities/employee.entity'

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name)

  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    try {
      const employee = this.employeeRepository.create(createEmployeeDto)
      await this.employeeRepository.save(employee)
      delete employee.password
      return employee
    } catch (error) {
      this.handleDBErrors(error)
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 20, offset = 0 } = paginationDto

    return this.employeeRepository.find({
      take: limit,
      skip: offset,
    })
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOneBy({ id })
    if (!employee)
      throw new NotFoundException(`Employee with ID ${id} not found`)
    return employee
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.employeeRepository.preload({
      id,
      ...updateEmployeeDto,
    })

    if (!employee)
      throw new NotFoundException(`Employee with id ${id} not found`)

    try {
      await this.employeeRepository.save(employee)
      return employee
    } catch (error) {
      this.handleDBErrors(error)
    }
  }

  async remove(id: string) {
    const sale = await this.findOne(id)
    await this.employeeRepository.remove(sale)
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail)

    console.log(error)

    throw new InternalServerErrorException('Please check server logs')
  }
}

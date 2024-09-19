import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'

import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { Order } from './entities/order.entity'

import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { handleDBExceptions } from 'src/common/helpers'
import { Sale } from 'src/sales/entities/sale.entity'

import { CustomersService } from 'src/customers/customers.service'
import { EmployeesService } from 'src/employees/employees.service'
import { ProductsService } from 'src/products/products.service'

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly customersService: CustomersService,
    private readonly employeesService: EmployeesService,
    private readonly productsService: ProductsService,

    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { products = [], employeeId, customerId, orderDate } = createOrderDto

    const customer = await this.customersService.findOne(customerId)
    const employee = await this.employeesService.findOne(employeeId)

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const order = this.orderRepository.create({
        orderDate,
        customer,
        employee,
      })

      await queryRunner.manager.save(order)

      const sales = await Promise.all(
        products.map(async sale => {
          const { productId, quantity } = sale

          const product = await this.productsService.findOne(productId)

          return this.saleRepository.create({
            quantity,
            salePrice: product.price,
            product,
            order,
          })
        }),
      )

      await queryRunner.manager.save(sales)
      await queryRunner.commitTransaction()

      return order
    } catch (error) {
      await queryRunner.rollbackTransaction()
      handleDBExceptions(this.logger, error)
    } finally {
      await queryRunner.release()
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 20, offset = 0 } = paginationDto

    return this.orderRepository.find({
      take: limit,
      skip: offset,
    })
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOneBy({ id })
    if (!order) throw new NotFoundException(`Order with ID ${id} not found`)

    return this.orderRepository.findOne({
      where: { id },
      relations: {
        customer: true,
        employee: true,
        sales: true,
      },
    })
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.orderRepository.preload({
      id,
      ...updateOrderDto,
    })

    if (!order) throw new NotFoundException(`Order with id ${id} not found`)

    try {
      await this.orderRepository.save(order)
      return order
    } catch (error) {
      handleDBExceptions(this.logger, error)
    }
  }

  async remove(id: string) {
    const order = await this.findOne(id)
    await this.orderRepository.remove(order)
  }
}

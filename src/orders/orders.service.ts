import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, In, Repository } from 'typeorm'

import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { Order } from './entities/order.entity'

import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { handleDBExceptions } from 'src/common/helpers'
import { OrderDetail } from 'src/order-details/entities/order-detail.entity'
import { Product } from 'src/products/entities/product.entity'
import { UserService } from 'src/user/user.service'

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly userService: UserService,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderDetail)
    private readonly detailRepository: Repository<OrderDetail>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { products = [], employeeId, customerId, orderDate } = createOrderDto

    const customer = await this.userService.findOne(customerId)
    const employee = await this.userService.findOne(employeeId)

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

      const pIDS = products.map(product => product.productId)
      const pEnts = await this.productRepository.findBy({ id: In(pIDS) })
      const productMap = new Map(pEnts.map(product => [product.id, product]))

      products.forEach(({ productId, quantity }) => {
        const { name, stock } = productMap.get(productId)
        if (stock < quantity)
          throw new Error(`Product ${name} has only ${stock} units in stock`)
      })

      const sales = await Promise.all(
        products.map(async ({ productId, quantity }) => {
          const product = productMap.get(productId)
          product.stock -= quantity
          await queryRunner.manager.save(product)

          return this.detailRepository.create({
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

  async findAll(paginationDto: PaginationDto) {
    const { limit = 20, offset = 0 } = paginationDto

    return await this.orderRepository.find({
      take: limit,
      skip: offset,
      relations: {
        customer: true,
        employee: true,
        details: {
          product: true,
        },
      },
    })
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        customer: true,
        employee: true,
        details: {
          product: true,
        },
      },
    })

    if (!order) throw new NotFoundException(`Order with ID ${id} not found`)
    return order
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
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const order = await this.findOne(id)
      const { details = [] } = order

      await Promise.all(
        details.map(async ({ product, quantity }) => {
          product.stock += quantity
          await queryRunner.manager.save(product)
        }),
      )

      await queryRunner.manager.remove(order)
      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      handleDBExceptions(this.logger, error)
    } finally {
      await queryRunner.release()
    }
  }
}

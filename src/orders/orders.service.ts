import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, In, QueryRunner, Repository } from 'typeorm'

import { CreateOrderDetailDto, CreateOrderDto, UpdateOrderDto } from './dto'
import { handleDBExceptions } from '../common/helpers'
import { Order, OrderDetail } from './entities'
import { PaginationDto } from '../common/dtos/pagination.dto'
import { Product } from '../products/entities/product.entity'
import { User } from '../auth/user/entities'
import { UserService } from '../auth/user/user.service'
import { ValidRoles } from '../auth/interfaces'

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly userService: UserService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderDetail)
    private readonly detailRepository: Repository<OrderDetail>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(employee: User, createOrderDto: CreateOrderDto) {
    const { products = [], dni, date, ...values } = createOrderDto

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const userDB = await this.userRepository.findOne({ where: { dni } })
      const customer = userDB ? userDB : await queryRunner.manager.save(this.userRepository.create({ dni, ...values }))

      if (employee.id === customer.id) throw new BadRequestException(`You can't create an order for yourself`)

      const order = this.orderRepository.create({
        date,
        customer,
        employee,
      })

      await queryRunner.manager.save(order)
      this.validateListProducts(products)

      const details = await this.insertProducts(queryRunner, order, products)
      await queryRunner.manager.save(details)
      await queryRunner.commitTransaction()

      details.forEach(detail => delete detail.order)
      order.details = details
      return order
    } catch (error) {
      await queryRunner.rollbackTransaction()
      handleDBExceptions(this.logger, error)
    } finally {
      await queryRunner.release()
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { search, limit = 20, offset = 0 } = paginationDto

    // TODO: Implement search functionality

    const [data, total] = await this.orderRepository.findAndCount({
      order: { date: 'DESC' },
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

    return {
      data,
      total,
      limit,
      offset,
    }
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

  async findOneByEmployee(employee: User, id: string) {
    const order = await this.findOne(id)

    try {
      this.checkOrderAccessPermission(employee, order)
    } catch (error) {
      handleDBExceptions(this.logger, error)
    }
    return order
  }

  async update(employee: User, id: string, updateDto: UpdateOrderDto) {
    const { date, customerId, products: newProductsDto } = updateDto

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      if (customerId && employee.id === customerId) {
        throw new BadRequestException(`You can't create an order for yourself`)
      }

      const order = await this.findOneByEmployee(employee, id)

      if (customerId) {
        if (employee.id === customerId) {
          throw new BadRequestException(`You can't assign an order to yourself`)
        }
        order.customer = await this.userService.findOne(customerId)
      }
      order.date = date ?? order.date
      await queryRunner.manager.save(order)

      if (!newProductsDto) {
        await queryRunner.commitTransaction()
        return order
      }

      this.validateListProducts(newProductsDto)

      const oldDetailsMap = new Map(order.details.map(detail => [detail.product.id, detail]))
      const newProductsMap = new Map(newProductsDto.map(p => [p.productId, p]))
      const operations = []

      for (const [productId, oldDetail] of oldDetailsMap.entries()) {
        const newProductData = newProductsMap.get(productId)
        if (newProductData) {
          const quantityDifference = oldDetail.quantity - newProductData.quantity
          if (quantityDifference !== 0) {
            oldDetail.product.stock += quantityDifference
            if (oldDetail.product.stock < 0) {
              throw new BadRequestException(`Product ${oldDetail.product.name} does not have enough stock`)
            }
            oldDetail.quantity = newProductData.quantity
            operations.push(queryRunner.manager.save(oldDetail.product))
            operations.push(queryRunner.manager.save(oldDetail))
          }
        } else {
          oldDetail.product.stock += oldDetail.quantity
          operations.push(queryRunner.manager.save(oldDetail.product))
          operations.push(queryRunner.manager.remove(oldDetail))
        }
      }

      const productsToAddDto = []
      for (const [productId, newProduct] of newProductsMap.entries()) {
        if (!oldDetailsMap.has(productId)) {
          productsToAddDto.push(newProduct)
        }
      }
      if (productsToAddDto.length > 0) {
        const newDetails = await this.insertProducts(queryRunner, order, productsToAddDto)
        operations.push(queryRunner.manager.save(newDetails))
      }

      await Promise.all(operations)
      await queryRunner.commitTransaction()

      order.details = await this.detailRepository.find({
        where: { order: { id } },
        relations: { product: true },
      })

      return order
    } catch (error) {
      await queryRunner.rollbackTransaction()
      handleDBExceptions(this.logger, error)
    } finally {
      await queryRunner.release()
    }
  }

  async remove(employee: User, id: string) {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const order = await this.findOneByEmployee(employee, id)
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

  private async insertProducts(
    queryRunner: QueryRunner,
    order: Order,
    products: CreateOrderDetailDto[],
  ): Promise<OrderDetail[]> {
    const pIDS = products.map(product => product.productId)
    const pEnts = await this.productRepository.findBy({ id: In(pIDS) })
    const productMap = new Map(pEnts.map(product => [product.id, product]))

    products.forEach(({ productId, quantity }) => {
      const { name, stock } = productMap.get(productId)
      if (stock < quantity) throw new BadRequestException(`Product ${name} has only ${stock} units in stock`)
    })

    return await Promise.all(
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
  }

  private checkOrderAccessPermission(employee: User, order: Order) {
    if (employee.id !== order.employee.id) {
      if (!employee.roles.includes(ValidRoles.ADMIN) && !employee.roles.includes(ValidRoles.SUPERUSER)) {
        throw new ForbiddenException(`Employee with ID ${employee.id} cannot access order with ID ${order.id}`)
      }
    }
  }

  private validateListProducts(products: CreateOrderDetailDto[]) {
    if (products.length === 0) throw new BadRequestException(`Products cannot be empty`)
    if (products.some(({ quantity }) => quantity <= 0)) throw new BadRequestException(`Quantity must be greater than 0`)
  }
}

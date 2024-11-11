import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, In, QueryRunner, Repository } from 'typeorm'

import { ValidRoles } from '../auth/interfaces'
import { User, UserService } from '../auth/user'
import { PaginationDto } from '../common/dtos/pagination.dto'
import { handleDBExceptions } from '../common/helpers'
import { Product } from '../products/entities/product.entity'
import { CreateOrderDetailDto, CreateOrderDto, UpdateOrderDto } from './dto'
import { Order, OrderDetail } from './entities'

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

  async create(employee: User, createOrderDto: CreateOrderDto) {
    const { products = [], customerId, orderDate } = createOrderDto

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const customer = await this.userService.findOne(customerId)
      if (employee.id === customer.id)
        throw new BadRequestException(`You can't create an order for yourself`)

      const order = this.orderRepository.create({
        orderDate,
        customer,
        employee,
      })

      await queryRunner.manager.save(order)
      this.validateListProducts(products)

      const details = await this.insertProducts(queryRunner, order, products)
      await queryRunner.manager.save(details)
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
    const { orderDate, customerId, products } = updateDto

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      if (customerId && employee.id === customerId) {
        throw new BadRequestException(`You can't create an order for yourself`)
      }

      const order = await this.findOneByEmployee(employee, id)

      let customer = order.customer
      if (customerId) customer = await this.userService.findOne(customerId)

      order.orderDate = orderDate ?? order.orderDate
      order.customer = customer
      await queryRunner.manager.save(order)

      if (!products) {
        await queryRunner.commitTransaction()
        return order
      }

      this.validateListProducts(products)

      const details = await this.detailRepository.find({
        where: { order },
        relations: { product: true },
      })

      await Promise.all(
        details.map(async ({ product, quantity }, index) => {
          const productIndex = products.findIndex(
            ({ productId }) => productId === product.id,
          )

          if (productIndex === -1) {
            product.stock += quantity
            await queryRunner.manager.save(product)
            await queryRunner.manager.remove(details[index])
          } else {
            const { quantity: newQuantity } = products[productIndex]

            if (quantity !== newQuantity) {
              product.stock += quantity - newQuantity
              if (product.stock < 0)
                throw new BadRequestException(
                  `Product ${product.name} does not have enough stock`,
                )
              await queryRunner.manager.save(product)
              details[index].quantity = newQuantity
              await queryRunner.manager.save(details[index])
            }

            products.splice(productIndex, 1)
          }
        }),
      )

      const newDetails = await this.insertProducts(queryRunner, order, products)
      await queryRunner.manager.save(newDetails)
      await queryRunner.commitTransaction()

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
      if (stock < quantity)
        throw new BadRequestException(
          `Product ${name} has only ${stock} units in stock`,
        )
    })

    const details = await Promise.all(
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

    return details
  }

  private checkOrderAccessPermission(employee: User, order: Order) {
    if (employee.id !== order.employee.id) {
      if (
        !employee.roles.includes(ValidRoles.ADMIN) &&
        !employee.roles.includes(ValidRoles.SUPERUSER)
      ) {
        throw new ForbiddenException(
          `Employee with ID ${employee.id} cannot access order with ID ${order.id}`,
        )
      }
    }
  }

  private validateListProducts(products: CreateOrderDetailDto[]) {
    if (products.length === 0)
      throw new BadRequestException(`Products cannot be empty`)
    if (products.some(({ quantity }) => quantity <= 0))
      throw new BadRequestException(`Quantity must be greater than 0`)
  }
}

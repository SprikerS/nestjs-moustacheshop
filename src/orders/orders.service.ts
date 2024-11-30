import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
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
    const { productos = [], dni, fecha, ...values } = createOrderDto

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const userDB = await this.userRepository.findOne({ where: { dni } })
      const customer = userDB
        ? userDB
        : await queryRunner.manager.save(
            this.userRepository.create({ dni, ...values }),
          )

      if (employee.id === customer.id)
        throw new BadRequestException(`You can't create an order for yourself`)

      const order = this.orderRepository.create({
        fecha,
        cliente: customer,
        empleado: employee,
      })

      await queryRunner.manager.save(order)
      this.validateListProducts(productos)

      const details = await this.insertProducts(queryRunner, order, productos)
      await queryRunner.manager.save(details)
      await queryRunner.commitTransaction()

      details.forEach(detail => delete detail.orden)
      order.detalles = details
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
        cliente: true,
        empleado: true,
        detalles: {
          producto: true,
        },
      },
    })
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        cliente: true,
        empleado: true,
        detalles: {
          producto: true,
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
    const { fecha, clienteId, productos } = updateDto

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      if (clienteId && employee.id === clienteId) {
        throw new BadRequestException(`You can't create an order for yourself`)
      }

      const order = await this.findOneByEmployee(employee, id)

      let customer = order.cliente
      if (clienteId) customer = await this.userService.findOne(clienteId)

      order.fecha = fecha ?? order.fecha
      order.cliente = customer
      await queryRunner.manager.save(order)

      if (!productos) {
        await queryRunner.commitTransaction()
        return order
      }

      this.validateListProducts(productos)

      const details = await this.detailRepository.find({
        where: { orden: order },
        relations: { producto: true },
      })

      await Promise.all(
        details.map(async ({ producto, cantidad }, index) => {
          const productIndex = productos.findIndex(
            ({ productoId }) => productoId === producto.id,
          )

          if (productIndex === -1) {
            producto.stock += cantidad
            await queryRunner.manager.save(producto)
            await queryRunner.manager.remove(details[index])
          } else {
            const { cantidad: newQuantity } = productos[productIndex]

            if (cantidad !== newQuantity) {
              producto.stock += cantidad - newQuantity
              if (producto.stock < 0)
                throw new BadRequestException(
                  `Product ${producto.nombre} does not have enough stock`,
                )
              await queryRunner.manager.save(producto)
              details[index].cantidad = newQuantity
              await queryRunner.manager.save(details[index])
            }

            productos.splice(productIndex, 1)
          }
        }),
      )

      const newDetails = await this.insertProducts(queryRunner, order, productos)
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
      const { detalles = [] } = order

      await Promise.all(
        detalles.map(async ({ producto, cantidad }) => {
          producto.stock += cantidad
          await queryRunner.manager.save(producto)
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
    const pIDS = products.map(product => product.productoId)
    const pEnts = await this.productRepository.findBy({ id: In(pIDS) })
    const productMap = new Map(pEnts.map(product => [product.id, product]))

    products.forEach(({ productoId, cantidad }) => {
      const { nombre, stock } = productMap.get(productoId)
      if (stock < cantidad)
        throw new BadRequestException(
          `Product ${nombre} has only ${stock} units in stock`,
        )
    })

    return await Promise.all(
      products.map(async ({ productoId, cantidad }) => {
        const product = productMap.get(productoId)
        product.stock -= cantidad
        await queryRunner.manager.save(product)

        return this.detailRepository.create({
          cantidad: cantidad,
          precioVenta: product.precio,
          producto: product,
          orden: order,
        })
      }),
    )
  }

  private checkOrderAccessPermission(employee: User, order: Order) {
    if (employee.id !== order.empleado.id) {
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
    if (products.some(({ cantidad }) => cantidad <= 0))
      throw new BadRequestException(`Quantity must be greater than 0`)
  }
}

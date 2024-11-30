import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Order } from '../orders/entities/order.entity'
import { Product } from '../products/entities/product.entity'
import { User } from '../auth/user/entities/user.entity'
import { ValidRoles } from '../auth/interfaces'

@Injectable()
export class SummariesService {
  private readonly logger = new Logger(SummariesService.name)

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async fetchSummaries() {
    const products = await this.getUsers()
    const users = await this.getProducts()
    const orders = await this.getOrders()

    return {
      ...products,
      ...users,
      ...orders,
    }
  }

  async getProducts() {
    const products = await this.productRepository.find({})

    const productsTotal = products.length
    const produtcsActive = products.filter(product => product.activo).length
    const produtcsInactive = products.filter(product => !product.activo).length

    return {
      productsTotal,
      produtcsActive,
      produtcsInactive,
    }
  }

  async getUsers() {
    const users = await this.userRepository.find({})

    const usersTotal = users.length
    const usersActive = users.filter(user => user.activo).length
    const usersInactive = users.filter(user => !user.activo).length

    const roleCounts = users.reduce(
      (counts, user) => {
        if (user.roles.includes(ValidRoles.CUSTOMER)) counts.customers++
        if (user.roles.includes(ValidRoles.EMPLOYEE)) counts.employees++
        if (user.roles.includes(ValidRoles.ADMIN)) counts.admins++
        return counts
      },
      { customers: 0, employees: 0, admins: 0 },
    )

    return {
      usersTotal,
      usersActive,
      usersInactive,
      usersCustomers: roleCounts.customers,
      usersEmployees: roleCounts.employees,
      usersAdmins: roleCounts.admins,
    }
  }

  async getOrders() {
    const orders = await this.orderRepository.find({
      relations: {
        cliente: true,
        empleado: true,
        detalles: {
          producto: true,
        },
      },
    })

    const ordersTotal = orders.length

    // Vendedor con más órdenes
    const employeeOrderCount: Record<string, { count: number; name: string }> =
      {}
    orders.forEach(order => {
      if (order.empleado) {
        const fullName = `${order.empleado.nombres} ${order.empleado.apellidoPaterno} ${order.empleado.apellidoMaterno}`
        if (!employeeOrderCount[order.empleado.id]) {
          employeeOrderCount[order.empleado.id] = { count: 0, name: fullName }
        }
        employeeOrderCount[order.empleado.id].count++
      }
    })
    const topEmployee = Object.values(employeeOrderCount).reduce(
      (max, current) => (current.count > max.count ? current : max),
      { count: 0, name: '' },
    ).name

    // Cliente con más compras
    const customerOrderCount: Record<string, { count: number; name: string }> =
      {}
    orders.forEach(order => {
      if (order.cliente) {
        const fullName = `${order.cliente.nombres} ${order.cliente.apellidoPaterno} ${order.cliente.apellidoMaterno}`
        if (!customerOrderCount[order.cliente.id]) {
          customerOrderCount[order.cliente.id] = { count: 0, name: fullName }
        }
        customerOrderCount[order.cliente.id].count++
      }
    })
    const topCustomer = Object.values(customerOrderCount).reduce(
      (max, current) => (current.count > max.count ? current : max),
      { count: 0, name: '' },
    ).name

    return {
      ordersTotal,
      topEmployee,
      topCustomer,
    }
  }
}

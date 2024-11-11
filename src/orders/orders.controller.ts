import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'

import { Auth, GetUser } from '../auth/decorators'
import { ValidRoles } from '../auth/interfaces'
import { User } from '../auth/user/entities'
import { PaginationDto } from '../common/dtos/pagination.dto'
import { CreateOrderDto, UpdateOrderDto } from './dto'
import { OrdersService } from './orders.service'

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Auth(ValidRoles.EMPLOYEE)
  create(@GetUser() employee: User, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(employee, createOrderDto)
  }

  @Get()
  @Auth(ValidRoles.ADMIN)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.ordersService.findAll(paginationDto)
  }

  @Get(':id')
  @Auth(ValidRoles.EMPLOYEE)
  findOne(@GetUser() employee: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOneByEmployee(employee, id)
  }

  @Patch(':id')
  @Auth(ValidRoles.EMPLOYEE)
  update(
    @GetUser() employee: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(employee, id, updateOrderDto)
  }

  @Delete(':id')
  @Auth(ValidRoles.EMPLOYEE)
  remove(@GetUser() employee: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.remove(employee, id)
  }
}

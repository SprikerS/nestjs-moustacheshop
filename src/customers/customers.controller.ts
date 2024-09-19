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

import { PaginationDto } from 'src/common/dtos/pagination.dto'

import { CustomersService } from './customers.service'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto)
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.customersService.findAll(paginationDto)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto)
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.remove(id)
  }
}

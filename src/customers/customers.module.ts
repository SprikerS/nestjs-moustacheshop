import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { CustomersController } from './customers.controller'
import { CustomersService } from './customers.service'
import { Customer } from './entities/customer.entity'

@Module({
  controllers: [CustomersController],
  providers: [CustomersService],
  imports: [TypeOrmModule.forFeature([Customer])],
})
export class CustomersModule {}

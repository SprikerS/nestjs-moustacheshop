import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Sale } from './entities/sale.entity'
import { SalesController } from './sales.controller'
import { SalesService } from './sales.service'

import { Product } from 'src/products/entities/product.entity'

@Module({
  controllers: [SalesController],
  providers: [SalesService],
  imports: [TypeOrmModule.forFeature([Sale, Product])],
})
export class SalesModule {}

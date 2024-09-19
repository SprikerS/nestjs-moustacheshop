import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Sale } from './entities/sale.entity'
import { SalesController } from './sales.controller'
import { SalesService } from './sales.service'

import { ProductsModule } from 'src/products/products.module'

@Module({
  controllers: [SalesController],
  providers: [SalesService],
  imports: [TypeOrmModule.forFeature([Sale]), ProductsModule],
  exports: [SalesService, TypeOrmModule],
})
export class SalesModule {}

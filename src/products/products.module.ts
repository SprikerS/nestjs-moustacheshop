import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { CategoriesModule } from '../categories/categories.module'
import { Product } from './entities/product.entity'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [CategoriesModule, TypeOrmModule.forFeature([Product])],
  exports: [ProductsService, TypeOrmModule],
})
export class ProductsModule {}

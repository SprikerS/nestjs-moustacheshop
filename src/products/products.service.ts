import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { Product } from './entities/product.entity'

import { Category } from '../categories/entities/category.entity'
import { handleDBExceptions } from '../common/helpers'
import { PaginationDto } from '../common/dtos/pagination.dto'

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name)

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const { categoryId } = createProductDto

    try {
      let category: Category | null = null
      if (categoryId) {
        category = await this.categoryRepository.findOne({
          where: { id: categoryId },
        })

        if (!category)
          throw new NotFoundException(
            `Category with ID ${categoryId} not found`,
          )
      }

      const product = this.productRepository.create({
        ...createProductDto,
        category,
      })

      return await this.productRepository.save(product)
    } catch (error) {
      handleDBExceptions(this.logger, error)
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 20, offset = 0 } = paginationDto
    return this.productRepository.find({
      order: { name: 'ASC' },
      take: limit,
      skip: offset,
      // TODO: Add relations to the query
    })
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOneBy({ id })
    if (!product) throw new NotFoundException(`Product with id ${id} not found`)
    return product
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto,
    })

    if (!product) throw new NotFoundException(`Product with id ${id} not found`)

    try {
      await this.productRepository.save(product)
      return product
    } catch (error) {
      handleDBExceptions(this.logger, error)
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id)
    await this.productRepository.remove(product)
  }
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { Product } from './entities/product.entity'

import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { handleDBExceptions } from 'src/common/helpers'

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name)

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto)
      await this.productRepository.save(product)
      return product
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

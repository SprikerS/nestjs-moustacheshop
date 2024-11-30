import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CategoriesService } from '../categories/categories.service'
import { Category } from '../categories/entities/category.entity'
import { CreateProductDto, UpdateProductDto } from './dto'
import { handleDBExceptions } from '../common/helpers'
import { PaginationDto } from '../common/dtos/pagination.dto'
import { Product } from './entities/product.entity'

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name)

  constructor(
    private readonly categoryService: CategoriesService,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const { categoriaId } = createProductDto

    try {
      const categoria = await this.resolveCategory(categoriaId)

      const product = this.productRepository.create({
        ...createProductDto,
        categoria,
      })

      return await this.productRepository.save(product)
    } catch (error) {
      handleDBExceptions(this.logger, error)
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 20, offset = 0 } = paginationDto
    return this.productRepository.find({
      order: { nombre: 'ASC' },
      take: limit,
      skip: offset,
    })
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOneBy({ id })
    if (!product) throw new NotFoundException(`Product with id ${id} not found`)
    return product
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { categoriaId } = updateProductDto

    try {
      const product = await this.productRepository.preload({
        id,
        ...updateProductDto,
      })

      if (!product)
        throw new NotFoundException(`Product with id ${id} not found`)

      product.categoria = await this.resolveCategory(categoriaId)

      return await this.productRepository.save(product)
    } catch (error) {
      handleDBExceptions(this.logger, error)
    }
  }

  async remove(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { detalles: true },
    })
    if (!product) throw new NotFoundException(`Product with id ${id} not found`)

    if (!product.detalles || product.detalles.length === 0) {
      await this.productRepository.remove(product)
    } else {
      product.activo = false
      await this.productRepository.save(product)
    }
  }

  private async resolveCategory(
    categoryId: string | null,
  ): Promise<Category | null> {
    if (categoryId === null) return null
    if (categoryId) return await this.categoryService.findOne(categoryId)
    return null
  }
}

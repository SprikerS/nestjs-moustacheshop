import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'

import { CategoriesService } from '../categories/categories.service'
import { Category } from '../categories/entities/category.entity'
import { CreateProductDto, PaginationProductDto, UpdateProductDto } from './dto'
import { handleDBExceptions } from '../common/helpers'
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
    const { categoryId } = createProductDto

    try {
      const category = await this.resolveCategory(categoryId)

      const product = this.productRepository.create({
        ...createProductDto,
        category,
      })

      return await this.productRepository.save(product)
    } catch (error) {
      handleDBExceptions(this.logger, error)
    }
  }

  async findAll(paginationDto: PaginationProductDto) {
    const { search, category, active, limit = 20, offset = 0 } = paginationDto

    const where: any = []

    if (search) {
      where.push({ name: ILike(`%${search}%`) }, { description: ILike(`%${search}%`) })
    }

    const categoryFilter = category ? { category: { name: category } } : undefined
    const activeFilter = typeof active === 'boolean' ? { active } : undefined

    const finalWhere =
      where.length > 0
        ? where.map(condition => ({
            ...condition,
            ...(categoryFilter || {}),
            ...(activeFilter || {}),
          }))
        : {
            ...(categoryFilter || {}),
            ...(activeFilter || {}),
          }

    const [data, total] = await this.productRepository.findAndCount({
      where: finalWhere,
      order: { name: 'ASC' },
      take: limit,
      skip: offset,
    })

    return {
      data,
      total,
      limit,
      offset,
    }
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOneBy({ id })
    if (!product) throw new NotFoundException(`Product with id ${id} not found`)
    return product
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { categoryId } = updateProductDto

    try {
      const product = await this.productRepository.preload({
        id,
        ...updateProductDto,
      })

      if (!product) throw new NotFoundException(`Product with id ${id} not found`)

      product.category = await this.resolveCategory(categoryId)

      return await this.productRepository.save(product)
    } catch (error) {
      handleDBExceptions(this.logger, error)
    }
  }

  async remove(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { details: true },
    })
    if (!product) throw new NotFoundException(`Product with id ${id} not found`)

    if (!product.details || product.details.length === 0) {
      await this.productRepository.remove(product)
    } else {
      product.active = false
      await this.productRepository.save(product)
    }
  }

  private async resolveCategory(categoryId: string | null): Promise<Category | null> {
    if (categoryId === null) return null
    if (categoryId) return await this.categoryService.findOne(categoryId)
    return null
  }
}

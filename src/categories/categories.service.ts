import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'

import { Category } from './entities/category.entity'
import { CreateCategoryDto, UpdateCategoryDto } from './dto'
import { handleDBExceptions } from '../common/helpers'
import { PaginationDto } from '../common/dtos/pagination.dto'

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name)

  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = this.categoryRepository.create(createCategoryDto)
      return await this.categoryRepository.save(category)
    } catch (error) {
      handleDBExceptions(this.logger, error)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { search, limit = 20, offset = 0 } = paginationDto

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const queryBuilder = queryRunner.manager
        .createQueryBuilder(Category, 'category')
        .leftJoin(
          subQuery => {
            return subQuery
              .select('product.category_id', 'category_id')
              .addSelect('COUNT(*)', 'count')
              .from('product', 'product')
              .groupBy('product.category_id')
          },
          'product_count',
          'product_count.category_id = category.id',
        )
        .select([
          'category.id AS id',
          'category.name AS name',
          'category.description AS description',
          'COALESCE(product_count.count, 0)::int AS "productsCount"',
        ])

      if (search) {
        queryBuilder.where('category.name ILIKE :search', {
          search: `%${search}%`,
        })
      }

      const total = await queryBuilder.getCount()
      const data = await queryBuilder.orderBy('category.name', 'ASC').offset(offset).limit(limit).getRawMany()

      await queryRunner.commitTransaction()

      return {
        data,
        total,
        limit,
        offset,
      }
    } catch (error) {
      await queryRunner.rollbackTransaction()
      handleDBExceptions(this.logger, error)
    } finally {
      await queryRunner.release()
    }
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOneBy({ id })
    if (!category) throw new NotFoundException(`Category with id ${id} not found`)

    return category
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.categoryRepository.preload({
        id,
        ...updateCategoryDto,
      })

      if (!category) throw new NotFoundException(`Category with id ${id} not found`)

      return this.categoryRepository.save(category)
    } catch (error) {
      handleDBExceptions(this.logger, error)
    }
  }

  async remove(id: string) {
    const category = await this.findOne(id)
    await this.categoryRepository.remove(category)
  }
}

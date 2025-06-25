import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Category } from './entities/category.entity'
import { CreateCategoryDto, UpdateCategoryDto } from './dto'
import { handleDBExceptions } from '../common/helpers'
import { PaginationDto } from '../common/dtos/pagination.dto'

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name)

  constructor(
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
    const { limit = 20, offset = 0 } = paginationDto
    return await this.categoryRepository.find({
      order: { name: 'ASC' },
      take: limit,
      skip: offset,
    })
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

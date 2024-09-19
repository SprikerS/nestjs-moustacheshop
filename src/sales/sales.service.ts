import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { handleDBExceptions } from 'src/common/helpers'
import { ProductsService } from 'src/products/products.service'

import { CreateSaleDto } from './dto/create-sale.dto'
import { UpdateSaleDto } from './dto/update-sale.dto'
import { Sale } from './entities/sale.entity'

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name)

  constructor(
    private readonly productsService: ProductsService,

    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    const { productId, quantity } = createSaleDto

    const product = await this.productsService.findOne(productId)

    try {
      const sale = this.saleRepository.create({
        quantity,
        salePrice: product.price,
        product,
      })

      return this.saleRepository.save(sale)
    } catch (error) {
      handleDBExceptions(this.logger, error)
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 20, offset = 0 } = paginationDto

    return this.saleRepository.find({
      take: limit,
      skip: offset,
      relations: {
        product: true,
      },
    })
  }

  async findOne(id: string) {
    const sale = await this.saleRepository.findOneBy({ id })
    if (!sale) throw new NotFoundException(`Sale with id ${id} not found`)

    return this.saleRepository.findOne({
      where: { id },
      relations: {
        product: true,
      },
    })
  }

  async update(id: string, updateSaleDto: UpdateSaleDto) {
    const sale = await this.saleRepository.preload({
      id,
      ...updateSaleDto,
    })

    if (!sale) throw new NotFoundException(`Sale with id ${id} not found`)

    try {
      await this.saleRepository.save(sale)
      return sale
    } catch (error) {
      handleDBExceptions(this.logger, error)
    }
  }

  async remove(id: string) {
    const sale = await this.findOne(id)
    await this.saleRepository.remove(sale)
  }
}

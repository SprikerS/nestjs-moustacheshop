import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { Product } from 'src/products/entities/product.entity'

import { CreateSaleDto } from './dto/create-sale.dto'
import { UpdateSaleDto } from './dto/update-sale.dto'
import { Sale } from './entities/sale.entity'

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name)

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    const { productId, quantity } = createSaleDto

    const product = await this.productRepository.findOneBy({ id: productId })
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`)
    }

    try {
      const sale = this.saleRepository.create({
        quantity,
        salePrice: product.price,
        product,
      })

      return this.saleRepository.save(sale)
    } catch (error) {
      this.handleDBExceptions(error)
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
      this.handleDBExceptions(error)
    }
  }

  async remove(id: string) {
    const sale = await this.findOne(id)
    await this.saleRepository.remove(sale)
  }

  private handleDBExceptions(error: any) {
    this.logger.error(error)
    if (error.code === '23505')
      throw new BadRequestException('Sale already exists')

    throw new InternalServerErrorException('Unexpected error, contact support')
  }
}

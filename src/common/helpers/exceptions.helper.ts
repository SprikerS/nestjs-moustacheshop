import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'

export function handleDBExceptions(logger: Logger, error: any): void {
  if (error.code === '23505') throw new BadRequestException(error.detail)

  this.logger.error(error)
  throw new InternalServerErrorException('Unexpected error, contact support')
}

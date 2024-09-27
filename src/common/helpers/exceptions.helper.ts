import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'

export function handleDBExceptions(logger: Logger, error: any): void {
  logger.error(error)

  if (error.code === '23505') throw new BadRequestException(error.detail)

  if (error instanceof BadRequestException) {
    throw new BadRequestException(error.message)
  }

  if (error instanceof ForbiddenException) {
    throw new ForbiddenException(error.message)
  }

  if (error instanceof NotFoundException)
    throw new NotFoundException(error.message)

  console.log(error)
  throw new InternalServerErrorException('Unexpected error, contact support')
}

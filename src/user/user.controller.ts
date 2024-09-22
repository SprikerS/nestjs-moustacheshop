import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'

import { UserService } from './user.service'
import { BaseUserDto, CreateUserDto, UpdateUserDto } from './dto'
import { PaginationDto } from 'src/common/dtos/pagination.dto'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto | BaseUserDto) {
    return this.userService.create(createUserDto)
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.userService.findAll(paginationDto)
  }

  @Post('scraping/:dni')
  mutationByDNI(@Param('dni') dni: string, @Query() query: { saved: string }) {
    const saved = query.saved === 'true'
    return this.userService.mutationByDNI(dni, saved)
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePersonDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updatePersonDto)
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.remove(id)
  }
}

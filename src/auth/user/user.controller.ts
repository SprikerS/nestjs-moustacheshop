import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'

import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { Auth, GetUser } from '../decorators'
import { ValidRoles } from '../interfaces'
import { BaseUserDto, CreateUserDto, LoginUserDto, UpdateUserDto } from './dto'
import { User } from './entities/user.entity'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  registerUser(@Body() createUserDto: CreateUserDto | BaseUserDto) {
    return this.userService.create(createUserDto)
  }

  @Post('login')
  @HttpCode(200)
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto)
  }

  @Get('check-auth-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.userService.checkAuthStatus(user)
  }

  @Post('scraping/:dni')
  mutationByDNI(@Param('dni') dni: string, @Query() query: { saved: string }) {
    const saved = query.saved === 'true'
    return this.userService.mutationByDNI(dni, saved)
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.userService.findAll(paginationDto)
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

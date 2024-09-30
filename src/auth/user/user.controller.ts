import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'

import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { Auth, GetUser } from '../decorators'
import { ValidRoles } from '../interfaces'
import {
  BaseUserDto,
  ChangePasswordDto,
  CreateUserDto,
  ForgotPasswordDto,
  LoginUserDto,
  ResetPasswordDto,
  UpdateUserDto,
} from './dto'
import { User } from './entities/user.entity'
import { ResetPwdQuery } from './interfaces'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('change-password')
  @Auth(ValidRoles.EMPLOYEE)
  @HttpCode(HttpStatus.OK)
  changePassword(
    @GetUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(user, changePasswordDto)
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.userService.forgotPassword(forgotPasswordDto)
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(
    @Query() query: ResetPwdQuery,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.userService.resetPassword(query, resetPasswordDto)
  }

  @Post('register')
  registerUser(@Body() createUserDto: CreateUserDto | BaseUserDto) {
    return this.userService.create(createUserDto)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
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

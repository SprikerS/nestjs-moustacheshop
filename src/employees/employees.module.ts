import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EmployeesController } from './employees.controller'
import { EmployeesService } from './employees.service'
import { Employee } from './entities/employee.entity'

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService],
  imports: [TypeOrmModule.forFeature([Employee])],
  exports: [EmployeesService],
})
export class EmployeesModule {}

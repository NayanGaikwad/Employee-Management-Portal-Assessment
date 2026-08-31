import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { QueryEmployeesDto } from './dto/query-employees.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import { EmployeesService } from './employees.service.js';

@ApiTags('employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @RequirePermissions('employees:read')
  @ApiOperation({ summary: 'List employees with pagination, search, filter and sort' })
  findAll(@Query() query: QueryEmployeesDto) {
    return this.employeesService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('employees:read')
  @ApiOperation({ summary: 'Get a single employee' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.findOne(id);
  }

  @Post()
  @RequirePermissions('employees:create')
  @ApiOperation({ summary: 'Create an employee' })
  create(
    @Body() dto: CreateEmployeeDto,
    @CurrentUser('sub') userId: number,
  ) {
    return this.employeesService.create(dto, userId);
  }

  @Patch(':id')
  @RequirePermissions('employees:update')
  @ApiOperation({ summary: 'Update an employee (soft fields)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser('sub') userId: number,
  ) {
    return this.employeesService.update(id, dto, userId);
  }

  @Delete(':id')
  @RequirePermissions('employees:delete')
  @ApiOperation({ summary: 'Soft-delete (deactivate) an employee' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
  ) {
    return this.employeesService.remove(id, userId);
  }
}

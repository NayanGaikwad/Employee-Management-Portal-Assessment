import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { EmploymentStatus } from '../../generated/prisma/enums.js';

export enum EmployeeSortField {
  name = 'name',
  joiningDate = 'joiningDate',
}

export enum SortDirection {
  asc = 'asc',
  desc = 'desc',
}

export class QueryEmployeesDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;

  @ApiPropertyOptional({ description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departmentId?: number;

  @ApiPropertyOptional({ enum: EmploymentStatus })
  @IsOptional()
  @IsEnum(EmploymentStatus)
  status?: EmploymentStatus;

  @ApiPropertyOptional({ enum: EmployeeSortField, default: 'name' })
  @IsOptional()
  @IsEnum(EmployeeSortField)
  sort: EmployeeSortField = EmployeeSortField.name;

  @ApiPropertyOptional({ enum: SortDirection, default: 'asc' })
  @IsOptional()
  @IsEnum(SortDirection)
  direction: SortDirection = SortDirection.asc;
}

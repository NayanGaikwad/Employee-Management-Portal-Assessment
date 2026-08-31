import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DepartmentStatus, EmploymentStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import {
  EmployeeSortField,
  QueryEmployeesDto,
  SortDirection,
} from './dto/query-employees.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryEmployeesDto) {
    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query);

    const [totalItems, items] = await this.prisma.$transaction([
      this.prisma.employee.count({ where }),
      this.prisma.employee.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: { department: true },
      }),
    ]);

    return {
      items,
      page: query.page,
      pageSize: query.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / query.pageSize),
    };
  }

  async findOne(id: number) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
      include: { department: true },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }
    return employee;
  }

  async create(dto: CreateEmployeeDto, byUserId?: number) {
    await this.validateDepartment(dto.departmentId, true);

    const employee = await this.prisma.$transaction(async (tx) => {
      const created = await tx.employee.create({
        data: {
          fullName: dto.fullName,
          email: dto.email,
          departmentId: dto.departmentId,
          jobTitle: dto.jobTitle,
          status: dto.status ?? EmploymentStatus.ACTIVE,
          joiningDate: new Date(dto.joiningDate),
        },
        include: { department: true },
      });

      await tx.auditLog.create({
        data: {
          entity: 'Employee',
          entityId: created.id,
          action: 'CREATE',
          byUserId: byUserId ?? null,
        },
      });

      return created;
    });

    return employee;
  }

  async update(id: number, dto: UpdateEmployeeDto, byUserId?: number) {
    const existing = await this.findOne(id);

    if (dto.departmentId !== undefined && dto.departmentId !== existing.departmentId) {
      await this.validateDepartment(dto.departmentId, true);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.employee.update({
        where: { id },
        data: {
          fullName: dto.fullName,
          email: dto.email,
          departmentId: dto.departmentId,
          jobTitle: dto.jobTitle,
          status: dto.status,
          joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : undefined,
        },
        include: { department: true },
      });

      await tx.auditLog.create({
        data: {
          entity: 'Employee',
          entityId: id,
          action: 'UPDATE',
          byUserId: byUserId ?? null,
        },
      });

      return updated;
    });
  }

  async remove(id: number, byUserId?: number) {
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.employee.update({
        where: { id },
        data: { deletedAt: new Date() },
        include: { department: true },
      });

      await tx.auditLog.create({
        data: {
          entity: 'Employee',
          entityId: id,
          action: 'DELETE',
          byUserId: byUserId ?? null,
        },
      });

      return updated;
    });
  }

  private buildWhere(query: QueryEmployeesDto) {
    const where: Record<string, unknown> = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.departmentId !== undefined) {
      where.departmentId = query.departmentId;
    }
    if (query.status) {
      where.status = query.status;
    }
    return where;
  }

  private buildOrderBy(query: QueryEmployeesDto) {
    const field =
      query.sort === EmployeeSortField.joiningDate ? 'joiningDate' : 'fullName';
    return {
      [field]: query.direction === SortDirection.desc ? 'desc' : 'asc',
    };
  }

  private async validateDepartment(departmentId: number, requireActive: boolean) {
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!department) {
      throw new BadRequestException(
        `Department with id ${departmentId} does not exist`,
      );
    }
    if (requireActive && department.status === DepartmentStatus.INACTIVE) {
      throw new BadRequestException(
        `Department '${department.name}' is inactive and cannot be assigned to new employees`,
      );
    }
  }
}

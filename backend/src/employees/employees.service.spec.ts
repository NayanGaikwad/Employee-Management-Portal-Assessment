import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DepartmentStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmployeesService } from './employees.service.js';
import {
  EmployeeSortField,
  QueryEmployeesDto,
  SortDirection,
} from './dto/query-employees.dto.js';

const mockPrisma = {
  $transaction: vi.fn(),
  employee: {
    count: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  department: {
    findUnique: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
};

describe('EmployeesService', () => {
  let service: EmployeesService;

  beforeEach(async () => {
    vi.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = moduleRef.get(EmployeesService);
  });

  describe('findAll', () => {
    it('builds pagination metadata and excludes soft-deleted employees', async () => {
      const query: QueryEmployeesDto = {
        page: 1,
        pageSize: 20,
        sort: EmployeeSortField.name,
        direction: SortDirection.asc,
      };
      mockPrisma.$transaction.mockResolvedValue([46, [{ id: 1 }]]);

      const result = await service.findAll(query);

      expect(result.totalItems).toBe(46);
      expect(result.totalPages).toBe(3);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
      expect(mockPrisma.employee.count).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          where: { deletedAt: null },
        }),
      );
    });

    it('applies search, filter, and sort to the where/orderBy clauses', async () => {
      const query: QueryEmployeesDto = {
        page: 2,
        pageSize: 10,
        search: 'sm',
        departmentId: 3,
        status: 'ACTIVE',
        sort: EmployeeSortField.joiningDate,
        direction: SortDirection.desc,
      };
      mockPrisma.$transaction.mockResolvedValue([5, []]);

      await service.findAll(query);

      const where = mockPrisma.employee.findMany.mock.calls[0][0].where;
      expect(where.deletedAt).toBeNull();
      expect(where.departmentId).toBe(3);
      expect(where.status).toBe('ACTIVE');
      expect(where.OR).toEqual([
        { fullName: { contains: 'sm', mode: 'insensitive' } },
        { email: { contains: 'sm', mode: 'insensitive' } },
      ]);

      const orderBy = mockPrisma.employee.findMany.mock.calls[0][0].orderBy;
      expect(orderBy).toEqual({ joiningDate: 'desc' });
      expect(mockPrisma.employee.findMany.mock.calls[0][0].skip).toBe(10);
    });
  });

  describe('findOne', () => {
    it('returns an employee when found and not deleted', async () => {
      mockPrisma.employee.findFirst.mockResolvedValue({ id: 9 });
      const result = await service.findOne(9);
      expect(result).toEqual({ id: 9 });
      expect(mockPrisma.employee.findFirst).toHaveBeenCalledWith({
        where: { id: 9, deletedAt: null },
        include: { department: true },
      });
    });

    it('throws NotFoundException when the employee is missing or deleted', async () => {
      mockPrisma.employee.findFirst.mockResolvedValue(null);
      await expect(service.findOne(9)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('rejects a non-existent department', async () => {
      mockPrisma.department.findUnique.mockResolvedValue(null);
      await expect(
        service.create(
          {
            fullName: 'A',
            email: 'a@b.com',
            departmentId: 999,
            jobTitle: 'E',
            joiningDate: '2023-01-01',
          },
          1,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects an inactive department for new employees', async () => {
      mockPrisma.department.findUnique.mockResolvedValue({
        id: 5,
        name: 'Ops',
        status: DepartmentStatus.INACTIVE,
      });
      await expect(
        service.create(
          {
            fullName: 'A',
            email: 'a@b.com',
            departmentId: 5,
            jobTitle: 'E',
            joiningDate: '2023-01-01',
          },
          1,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('creates the employee and an audit log in one transaction', async () => {
      mockPrisma.department.findUnique.mockResolvedValue({
        id: 1,
        name: 'Eng',
        status: DepartmentStatus.ACTIVE,
      });
      mockPrisma.$transaction.mockImplementation(
        async (callback: (tx: unknown) => Promise<unknown>) => {
          return callback(mockPrisma);
        },
      );
      mockPrisma.employee.create.mockResolvedValue({ id: 3, departmentId: 1 });
      mockPrisma.auditLog.create.mockResolvedValue({});

      await service.create(
        {
          fullName: 'A',
          email: 'a@b.com',
          departmentId: 1,
          jobTitle: 'E',
          joiningDate: '2023-01-01',
        },
        7,
      );

      expect(mockPrisma.employee.create).toHaveBeenCalled();
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          entity: 'Employee',
          entityId: 3,
          action: 'CREATE',
          byUserId: 7,
        },
      });
    });
  });
});

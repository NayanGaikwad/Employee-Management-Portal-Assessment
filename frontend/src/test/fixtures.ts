import type {
  Department,
  Employee,
  EmployeeListResponse,
} from '@/lib/types'

export const departments: Department[] = [
  {
    id: 1,
    name: 'Engineering',
    status: 'ACTIVE',
    createdAt: '2026-08-31T17:08:15.109Z',
    updatedAt: '2026-08-31T17:08:15.109Z',
  },
  {
    id: 2,
    name: 'Design',
    status: 'ACTIVE',
    createdAt: '2026-08-31T17:08:15.109Z',
    updatedAt: '2026-08-31T17:08:15.109Z',
  },
  {
    id: 3,
    name: 'Archived',
    status: 'INACTIVE',
    createdAt: '2026-08-31T17:08:15.109Z',
    updatedAt: '2026-08-31T17:08:15.109Z',
  },
]

function makeEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: 1,
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    departmentId: 1,
    department: departments[0],
    jobTitle: 'Software Engineer',
    status: 'ACTIVE',
    joiningDate: '2024-01-15',
    deletedAt: null,
    createdAt: '2026-08-31T17:08:15.109Z',
    updatedAt: '2026-08-31T17:08:15.109Z',
    ...overrides,
  }
}

export const employees: Employee[] = [
  makeEmployee({ id: 1, fullName: 'Jane Doe', email: 'jane@example.com' }),
  makeEmployee({
    id: 2,
    fullName: 'John Smith',
    email: 'john@example.com',
    status: 'INACTIVE',
    departmentId: 2,
    department: departments[1],
  }),
]

export function makeListResponse(
  overrides: Partial<EmployeeListResponse> = {},
): EmployeeListResponse {
  return {
    items: employees,
    page: 1,
    pageSize: 20,
    totalItems: employees.length,
    totalPages: 1,
    ...overrides,
  }
}

export const adminUser = { id: 1, email: 'admin@example.com', roleName: 'ADMIN' }
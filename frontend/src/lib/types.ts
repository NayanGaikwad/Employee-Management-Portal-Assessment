import {
  EMPLOYMENT_STATUSES,
  type EmploymentStatus,
} from '@/features/employees/constants/status-options'

export interface Department {
  id: number
  name: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
}

export interface DepartmentDetail extends Department {
  _count: { employees: number }
}

export interface Employee {
  id: number
  fullName: string
  email: string
  departmentId: number
  department: Department
  jobTitle: string
  status: EmploymentStatus
  joiningDate: string
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface EmployeeListResponse {
  items: Employee[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export type EmployeeSortField = 'name' | 'joiningDate'
export type SortDirection = 'asc' | 'desc'

export interface EmployeeListParams {
  page: number
  pageSize: number
  search?: string
  departmentId?: number
  status?: EmploymentStatus
  sort: EmployeeSortField
  direction: SortDirection
}

export interface AuthUser {
  id: number
  email: string
  roleName: string
}

export interface AuthResponse {
  accessToken: string
  user: AuthUser
}

export const STATUS_VALUES = EMPLOYMENT_STATUSES
export type { EmploymentStatus }
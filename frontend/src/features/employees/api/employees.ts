import { api } from '@/lib/api'
import type {
  Employee,
  EmployeeListParams,
  EmployeeListResponse,
} from '@/lib/types'

export function fetchEmployees(
  params: EmployeeListParams,
): Promise<EmployeeListResponse> {
  return api.get<EmployeeListResponse>('/employees', {
    ...params,
    departmentId: params.departmentId,
  })
}

export function fetchEmployee(id: number): Promise<Employee> {
  return api.get<Employee>(`/employees/${id}`)
}

export interface CreateEmployeePayload {
  fullName: string
  email: string
  departmentId: number
  jobTitle: string
  status: 'ACTIVE' | 'INACTIVE'
  joiningDate: string
}

export type UpdateEmployeePayload = Partial<CreateEmployeePayload>

export function createEmployee(payload: CreateEmployeePayload): Promise<Employee> {
  return api.post<Employee>('/employees', payload)
}

export function updateEmployee(
  id: number,
  payload: UpdateEmployeePayload,
): Promise<Employee> {
  return api.patch<Employee>(`/employees/${id}`, payload)
}

export function deleteEmployee(id: number): Promise<Employee> {
  return api.delete<Employee>(`/employees/${id}`)
}
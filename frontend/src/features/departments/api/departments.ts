import { api } from '@/lib/api'
import type { Department, DepartmentDetail } from '@/lib/types'

export function fetchDepartments(): Promise<Department[]> {
  return api.get<Department[]>('/departments')
}

export function fetchDepartment(id: number): Promise<DepartmentDetail> {
  return api.get<DepartmentDetail>(`/departments/${id}`)
}
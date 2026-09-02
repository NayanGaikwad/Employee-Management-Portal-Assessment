import { useQuery } from '@tanstack/react-query'
import {
  fetchDepartment,
  fetchDepartments,
} from '@/features/departments/api/departments'
import { queryKeys } from '@/lib/query-keys'

export function useDepartmentsQuery() {
  return useQuery({
    queryKey: queryKeys.departments.list(),
    queryFn: fetchDepartments,
  })
}

export function useDepartmentQuery(id: number) {
  return useQuery({
    queryKey: queryKeys.departments.detail(id),
    queryFn: () => fetchDepartment(id),
    enabled: Number.isInteger(id),
  })
}
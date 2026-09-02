import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  createEmployee,
  deleteEmployee,
  fetchEmployee,
  fetchEmployees,
  updateEmployee,
  type CreateEmployeePayload,
  type UpdateEmployeePayload,
} from '@/features/employees/api/employees'
import { queryKeys } from '@/lib/query-keys'
import type { EmployeeListParams } from '@/lib/types'

export function useEmployeesListQuery(params: EmployeeListParams) {
  return useQuery({
    queryKey: queryKeys.employees.list(params),
    queryFn: () => fetchEmployees(params),
    placeholderData: keepPreviousData,
  })
}

export function useEmployeeQuery(id: number) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id),
    queryFn: () => fetchEmployee(id),
    enabled: Number.isInteger(id),
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) => createEmployee(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.employees.all })
    },
  })
}

export function useUpdateEmployee(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateEmployeePayload) => updateEmployee(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.employees.all })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.employees.detail(id),
      })
    },
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteEmployee(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.employees.all })
    },
  })
}
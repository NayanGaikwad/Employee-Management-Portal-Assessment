import { z } from 'zod'
import { EmploymentStatusSchema } from '@/features/employees/constants/status-options'

const optionalNumber = z
  .preprocess(
    (value) => (value === '' || value === undefined ? undefined : value),
    z.coerce.number().int().positive(),
  )
  .optional()
  .catch(undefined)

export const employeeListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).catch(20).default(20),
  search: z.string().trim().optional().catch(undefined),
  departmentId: optionalNumber,
  status: EmploymentStatusSchema.optional().catch(undefined),
  sort: z.enum(['name', 'joiningDate']).catch('name').default('name'),
  direction: z.enum(['asc', 'desc']).catch('asc').default('asc'),
})

export type EmployeeListSearch = z.infer<typeof employeeListSearchSchema>

export const DEFAULT_LIST_SEARCH: EmployeeListSearch = {
  page: 1,
  pageSize: 20,
  sort: 'name',
  direction: 'asc',
}
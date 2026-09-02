import { z } from 'zod'

/**
 * Single source of truth for employment status values.
 *
 * The assessment includes a live change to add `PROBATION`. Add one entry
 * here (plus the matching backend enum value) and every layer — types,
 * validation, badges and the status filter/select — picks it up.
 */
export const EMPLOYMENT_STATUSES = ['ACTIVE', 'INACTIVE'] as const

export const EmploymentStatusSchema = z.enum(EMPLOYMENT_STATUSES)
export type EmploymentStatus = z.infer<typeof EmploymentStatusSchema>

export const EMPLOYMENT_STATUS_OPTIONS: ReadonlyArray<{
  value: EmploymentStatus
  label: string
}> = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
]

export function employmentStatusLabel(status: EmploymentStatus): string {
  return (
    EMPLOYMENT_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  )
}
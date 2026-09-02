import { describe, expect, it } from 'vitest'
import {
  DEFAULT_EMPLOYEE_VALUES,
  employeeSchema,
  toEmployeePayload,
} from '@/features/employees/schemas/employee-schema'
import { employeeListSearchSchema } from '@/features/employees/schemas/employee-list-params'

const valid = {
  fullName: '  Jane Doe  ',
  email: '  JANE@EXAMPLE.COM  ',
  departmentId: 1,
  jobTitle: 'Software Engineer',
  status: 'ACTIVE',
  joiningDate: '2024-01-15',
}

describe('employeeSchema', () => {
  it('accepts a valid payload and trims + lowercases fields', () => {
    const result = employeeSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.fullName).toBe('Jane Doe')
    expect(result.data.email).toBe('jane@example.com')
  })

  it('rejects a missing full name', () => {
    const { success, error } = employeeSchema.safeParse({
      ...valid,
      fullName: '   ',
    })
    expect(success).toBe(false)
    expect(error?.issues[0]?.message).toBe('Full name is required.')
  })

  it('rejects an invalid email', () => {
    const { success } = employeeSchema.safeParse({ ...valid, email: 'not-an-email' })
    expect(success).toBe(false)
  })

  it('rejects a missing department', () => {
    const { success } = employeeSchema.safeParse({ ...valid, departmentId: 0 })
    expect(success).toBe(false)
  })

  it('rejects a missing job title', () => {
    const { success } = employeeSchema.safeParse({ ...valid, jobTitle: ' ' })
    expect(success).toBe(false)
  })

  it('rejects an invalid status', () => {
    const { success } = employeeSchema.safeParse({ ...valid, status: 'PROBATION' })
    expect(success).toBe(false)
  })

  it('rejects a malformed joining date', () => {
    const { success } = employeeSchema.safeParse({
      ...valid,
      joiningDate: '01/15/2024',
    })
    expect(success).toBe(false)
  })

  it('toEmployeePayload maps validated values to the API shape', () => {
    const parsed = employeeSchema.parse(valid)
    expect(toEmployeePayload(parsed)).toEqual({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      departmentId: 1,
      jobTitle: 'Software Engineer',
      status: 'ACTIVE',
      joiningDate: '2024-01-15',
    })
  })

  it('provides safe defaults for the create form', () => {
    expect(DEFAULT_EMPLOYEE_VALUES).toMatchObject({
      status: 'ACTIVE',
      fullName: '',
      email: '',
    })
  })
})

describe('employeeListSearchSchema', () => {
  it('defaults pagination and sorting when empty', () => {
    const parsed = employeeListSearchSchema.parse({})
    expect(parsed).toMatchObject({
      page: 1,
      pageSize: 20,
      sort: 'name',
      direction: 'asc',
    })
    expect(parsed.search).toBeUndefined()
    expect(parsed.departmentId).toBeUndefined()
    expect(parsed.status).toBeUndefined()
  })

  it('coerces numeric strings and resets invalid page values', () => {
    const parsed = employeeListSearchSchema.parse({
      page: '3',
      pageSize: '50',
      departmentId: '2',
    })
    expect(parsed.page).toBe(3)
    expect(parsed.pageSize).toBe(50)
    expect(parsed.departmentId).toBe(2)
  })

  it('parses an explicit status and sort', () => {
    const parsed = employeeListSearchSchema.parse({
      status: 'INACTIVE',
      sort: 'joiningDate',
      direction: 'desc',
    })
    expect(parsed.status).toBe('INACTIVE')
    expect(parsed.sort).toBe('joiningDate')
    expect(parsed.direction).toBe('desc')
  })
})
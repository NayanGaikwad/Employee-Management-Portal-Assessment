import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { FieldError } from '@/components/ui/form-field'
import { useToast } from '@/components/ui/toast'
import {
  EMPLOYMENT_STATUS_OPTIONS,
} from '@/features/employees/constants/status-options'
import {
  DEFAULT_EMPLOYEE_VALUES,
  employeeSchema,
  toEmployeePayload,
  type EmployeeFormValues,
} from '@/features/employees/schemas/employee-schema'
import { useCreateEmployee, useUpdateEmployee } from '@/features/employees/hooks/use-employees'
import { ApiError } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'
import type { Department, Employee } from '@/lib/types'

interface EmployeeFormProps {
  mode: 'create' | 'edit'
  employeeId?: number
  initialValues: EmployeeFormValues
  departments: Department[]
}

export function EmployeeForm({
  mode,
  employeeId,
  initialValues,
  departments,
}: EmployeeFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  const activeDepartments = departments.filter((d) => d.status === 'ACTIVE')
  const currentDepartmentId = initialValues.departmentId
  const selectableDepartments = activeDepartments.some(
    (d) => d.id === currentDepartmentId,
  )
    ? activeDepartments
    : [...activeDepartments, departments.find((d) => d.id === currentDepartmentId)].filter(
        (d): d is Department => Boolean(d),
      )

  const createMutation = useCreateEmployee()
  const updateMutation = useUpdateEmployee(employeeId ?? -1)

  const pending = createMutation.isPending || updateMutation.isPending

  const form = useForm({
    defaultValues: { ...DEFAULT_EMPLOYEE_VALUES, ...initialValues },
    validators: { onSubmit: employeeSchema },
    onSubmit: async ({ value }) => {
      setServerError(null)
      const payload = toEmployeePayload(value)
      const mutation = mode === 'create' ? createMutation : updateMutation
      try {
        const result = await mutation.mutateAsync(payload)
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.employees.all }),
          queryClient.invalidateQueries({ queryKey: queryKeys.departments.all }),
        ])
        toast({
          title:
            mode === 'create'
              ? 'Employee created'
              : 'Employee updated',
          description: `${result.fullName} was saved.`,
          variant: 'success',
        })
        await router.navigate({
          to: '/employees/$employeeId',
          params: { employeeId: String(result.id) },
        })
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.statusCode === 409) {
            form.setFieldMeta('email', (meta) => ({
              ...meta,
              errorMap: {
                ...meta.errorMap,
                onSubmit: 'This email address is already in use.',
              },
            }))
          }
          setServerError(error.friendlyMessage)
        } else {
          setServerError('Something went wrong. Please try again.')
        }
      }
    },
  })

  return (
    <Card className="max-w-3xl">
      <CardContent className="pt-6">
        <form
          noValidate
          onSubmit={(event: FormEvent) => {
            event.preventDefault()
            void form.handleSubmit()
            if (form.state.errors.length) return
          }}
          className="space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field
              name="fullName"
              validators={{ onBlur: employeeSchema.shape.fullName }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Full name *</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    placeholder="Jane Doe"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={Boolean(field.state.meta.errors.length)}
                    autoFocus={mode === 'create'}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Field
              name="email"
              validators={{ onBlur: employeeSchema.shape.email }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Email *</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="off"
                    placeholder="jane.doe@example.com"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={Boolean(field.state.meta.errors.length)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Field
              name="departmentId"
              validators={{ onBlur: employeeSchema.shape.departmentId }}
            >
              {(field) => {
                const value = Number.isInteger(field.state.value)
                  ? String(field.state.value)
                  : ''
                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Department *</Label>
                    <Select
                      value={value}
                      onValueChange={(next) => field.handleChange(Number(next))}
                      onOpenChange={field.handleBlur}
                    >
                      <SelectTrigger id={field.name} aria-label="Department">
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectableDepartments.map((department) => {
                          const isInactive = department.status === 'INACTIVE'
                          const isCurrent = department.id === currentDepartmentId
                          const disabled = isInactive && !(mode === 'edit' && isCurrent)
                          return (
                            <SelectItem
                              key={department.id}
                              value={String(department.id)}
                              disabled={disabled}
                            >
                              {department.name}
                              {isInactive ? ' (Inactive)' : ''}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <FieldError errors={field.state.meta.errors} />
                  </div>
                )
              }}
            </form.Field>

            <form.Field
              name="jobTitle"
              validators={{ onBlur: employeeSchema.shape.jobTitle }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Job title *</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    placeholder="Software Engineer"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={Boolean(field.state.meta.errors.length)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Field
              name="status"
              validators={{ onBlur: employeeSchema.shape.status }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Status *</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(
                        value as
                          | 'ACTIVE'
                          | 'INACTIVE',
                      )
                    }
                    onOpenChange={field.handleBlur}
                  >
                    <SelectTrigger id={field.name} aria-label="Employment status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Field
              name="joiningDate"
              validators={{ onBlur: employeeSchema.shape.joiningDate }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Joining date *</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="date"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={Boolean(field.state.meta.errors.length)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>
          </div>

          {serverError ? <FieldError errors={[serverError]} /> : null}

          <div className="flex items-center gap-2 border-t pt-4">
            <Button
              type="submit"
              disabled={pending}
              className="min-w-28"
            >
              {pending
                ? 'Saving…'
                : mode === 'create'
                  ? 'Create employee'
                  : 'Save changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.history.back()}
              disabled={pending}
            >
              Cancel
            </Button>
            <p className="ml-auto text-xs text-muted-foreground">
              * required fields
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export function toFormDefaults(employee: Employee): EmployeeFormValues {
  return {
    fullName: employee.fullName,
    email: employee.email,
    departmentId: employee.departmentId,
    jobTitle: employee.jobTitle,
    status: employee.status,
    joiningDate: employee.joiningDate.slice(0, 10),
  }
}
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorState } from '@/components/layout/feedback'
import { InlineLoader } from '@/components/ui/spinner'
import { PageHeader } from '@/components/layout/page-header'
import { useDepartmentsQuery } from '@/features/departments/hooks/use-departments'
import { EmployeeForm } from '@/features/employees/components/employee-form'
import { DEFAULT_EMPLOYEE_VALUES } from '@/features/employees/schemas/employee-schema'

export const Route = createFileRoute('/_authenticated/employees/new')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAdmin) {
      throw redirect({ to: '/employees' })
    }
  },
  component: NewEmployeePage,
})

function NewEmployeePage() {
  const departmentsQuery = useDepartmentsQuery()

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Add employee"
        description="Create a new employee record. All fields are required."
      />

      {departmentsQuery.isPending ? (
        <Card>
          <CardContent className="p-6">
            <InlineLoader label="Loading departments…" />
          </CardContent>
        </Card>
      ) : departmentsQuery.isError ? (
        <Card>
          <CardContent className="p-6">
            <ErrorState
              title="Could not load departments"
              onRetry={() => void departmentsQuery.refetch()}
            />
          </CardContent>
        </Card>
      ) : (
        <EmployeeForm
          mode="create"
          initialValues={DEFAULT_EMPLOYEE_VALUES}
          departments={departmentsQuery.data}
        />
      )}
    </div>
  )
}
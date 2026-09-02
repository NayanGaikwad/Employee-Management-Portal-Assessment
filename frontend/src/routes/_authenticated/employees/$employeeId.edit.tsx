import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { InlineLoader } from '@/components/ui/spinner'
import { ErrorState } from '@/components/layout/feedback'
import { PageHeader } from '@/components/layout/page-header'
import { useDepartmentsQuery } from '@/features/departments/hooks/use-departments'
import { useEmployeeQuery } from '@/features/employees/hooks/use-employees'
import {
  EmployeeForm,
  toFormDefaults,
} from '@/features/employees/components/employee-form'
import { ApiError } from '@/lib/api'

export const Route = createFileRoute('/_authenticated/employees/$employeeId/edit')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAdmin) {
      throw redirect({ to: '/employees' })
    }
  },
  component: EditEmployeePage,
})

function EditEmployeePage() {
  const { employeeId } = Route.useParams()
  const id = Number(employeeId)
  const employeeQuery = useEmployeeQuery(id)
  const departmentsQuery = useDepartmentsQuery()

  const isLoading =
    employeeQuery.isPending && !employeeQuery.data
      ? true
      : departmentsQuery.isPending

  const notFound =
    employeeQuery.error instanceof ApiError &&
    employeeQuery.error.statusCode === 404

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Edit employee"
        description="Update the employee details below."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/employees/$employeeId" params={{ employeeId }}>
              <ArrowLeft />
              Back to details
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <InlineLoader label="Loading employee…" />
          </CardContent>
        </Card>
      ) : employeeQuery.isError ? (
        <Card>
          <CardContent className="p-6">
            <ErrorState
              title={notFound ? 'Employee not found' : 'Could not load employee'}
              description={
                employeeQuery.error instanceof ApiError
                  ? employeeQuery.error.friendlyMessage
                  : 'Please try again.'
              }
              onRetry={() => void employeeQuery.refetch()}
            />
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
      ) : employeeQuery.data && departmentsQuery.data ? (
        <EmployeeForm
          mode="edit"
          employeeId={id}
          initialValues={toFormDefaults(employeeQuery.data)}
          departments={departmentsQuery.data}
        />
      ) : null}
    </div>
  )
}
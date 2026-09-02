import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { InlineLoader } from '@/components/ui/spinner'
import { ErrorState } from '@/components/layout/feedback'
import { PageHeader } from '@/components/layout/page-header'
import { EmployeeDetail } from '@/features/employees/components/employee-detail'
import { useEmployeeQuery } from '@/features/employees/hooks/use-employees'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth'

export const Route = createFileRoute(
  '/_authenticated/employees/$employeeId/',
)({
  component: EmployeeDetailPage,
})

function EmployeeDetailPage() {
  const { employeeId } = Route.useParams()
  const id = Number(employeeId)
  const { isAdmin } = useAuth()
  const employeeQuery = useEmployeeQuery(id)

  return (
    <div>
      <PageHeader
        title="Employee details"
        description={undefined}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/employees">
              <ArrowLeft />
              Back to employees
            </Link>
          </Button>
        }
      />

      {employeeQuery.isPending && !employeeQuery.data ? (
        <Card>
          <CardContent className="p-6">
            <InlineLoader label="Loading employee…" />
          </CardContent>
        </Card>
      ) : employeeQuery.isError ? (
        <Card>
          <CardContent className="p-6">
            <ErrorState
              title={
                employeeQuery.error instanceof ApiError &&
                employeeQuery.error.statusCode === 404
                  ? 'Employee not found'
                  : 'Could not load employee'
              }
              description={
                employeeQuery.error instanceof ApiError
                  ? employeeQuery.error.friendlyMessage
                  : 'Please try again.'
              }
              onRetry={() => void employeeQuery.refetch()}
            />
          </CardContent>
        </Card>
      ) : (
        <EmployeeDetail employee={employeeQuery.data} canEdit={isAdmin} />
      )}
    </div>
  )
}
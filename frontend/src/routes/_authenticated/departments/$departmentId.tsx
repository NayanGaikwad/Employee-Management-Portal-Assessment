import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { InlineLoader } from '@/components/ui/spinner'
import { ErrorState } from '@/components/layout/feedback'
import { PageHeader } from '@/components/layout/page-header'
import { useDepartmentQuery } from '@/features/departments/hooks/use-departments'
import { ApiError } from '@/lib/api'

export const Route = createFileRoute('/_authenticated/departments/$departmentId')({
  component: DepartmentDetailPage,
})

function DepartmentDetailPage() {
  const { departmentId } = Route.useParams()
  const id = Number(departmentId)
  const departmentQuery = useDepartmentQuery(id)

  const notFound =
    departmentQuery.error instanceof ApiError &&
    departmentQuery.error.statusCode === 404

  return (
    <div>
      <PageHeader
        title="Department details"
        description={undefined}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/departments">
              <ArrowLeft />
              Back to departments
            </Link>
          </Button>
        }
      />

      {departmentQuery.isPending && !departmentQuery.data ? (
        <Card>
          <CardContent className="p-6">
            <InlineLoader label="Loading department…" />
          </CardContent>
        </Card>
      ) : departmentQuery.isError ? (
        <Card>
          <CardContent className="p-6">
            <ErrorState
              title={notFound ? 'Department not found' : 'Could not load department'}
              description={
                departmentQuery.error instanceof ApiError
                  ? departmentQuery.error.friendlyMessage
                  : 'Please try again.'
              }
              onRetry={() => void departmentQuery.refetch()}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-xl">
          <CardHeader>
            <h2 className="text-xl font-semibold tracking-tight">
              {departmentQuery.data.name}
            </h2>
            <div className="flex items-center gap-2">
              <DepartmentStatusBadge status={departmentQuery.data.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {departmentQuery.data._count.employees} active employee
              {departmentQuery.data._count.employees === 1 ? '' : 's'}
            </div>
            {departmentQuery.data.status === 'INACTIVE' ? (
              <p className="text-sm text-muted-foreground">
                This department is inactive. It cannot be assigned to new
                employees, but existing employees keep their assignments.
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function DepartmentStatusBadge({ status }: { status: 'ACTIVE' | 'INACTIVE' }) {
  return status === 'ACTIVE' ? (
    <Badge variant="success">Active</Badge>
  ) : (
    <Badge variant="muted">Inactive</Badge>
  )
}
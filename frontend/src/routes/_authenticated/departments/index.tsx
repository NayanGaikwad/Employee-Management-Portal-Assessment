import { createFileRoute, Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { InlineLoader } from '@/components/ui/spinner'
import { ErrorState, EmptyState } from '@/components/layout/feedback'
import { PageHeader } from '@/components/layout/page-header'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDepartmentsQuery } from '@/features/departments/hooks/use-departments'
import type { Department } from '@/lib/types'

export const Route = createFileRoute('/_authenticated/departments/')({
  component: DepartmentsListPage,
})

function DepartmentsListPage() {
  const departmentsQuery = useDepartmentsQuery()

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Reference list of departments used by employee records."
      />

      <Card>
        <CardContent className="p-0">
          {departmentsQuery.isPending ? (
            <div className="p-6">
              <InlineLoader label="Loading departments…" />
            </div>
          ) : departmentsQuery.isError ? (
            <div className="p-6">
              <ErrorState
                title="Could not load departments"
                onRetry={() => void departmentsQuery.refetch()}
              />
            </div>
          ) : departmentsQuery.data.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No departments" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentsQuery.data.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>
                      <Link
                        to="/departments/$departmentId"
                        params={{ departmentId: String(department.id) }}
                        className="font-medium hover:underline"
                      >
                        {department.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <DepartmentStatusBadge status={department.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DepartmentStatusBadge({ status }: { status: Department['status'] }) {
  return status === 'ACTIVE' ? (
    <Badge variant="success">Active</Badge>
  ) : (
    <Badge variant="muted">Inactive</Badge>
  )
}
import { Link } from '@tanstack/react-router'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { EmploymentStatusBadge } from '@/components/ui/badge'
import type { Employee } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { EmployeeAvatar } from '@/components/ui/avatar'

interface EmployeeDetailProps {
  employee: Employee
  canEdit: boolean
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm">{value}</dd>
    </div>
  )
}

export function EmployeeDetail({ employee, canEdit }: EmployeeDetailProps) {
  return (
    <Card className="max-w-2xl">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex items-center gap-4">
          <EmployeeAvatar
            name={employee.fullName}
            className="h-14 w-14 text-lg"
          />
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {employee.fullName}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <EmploymentStatusBadge status={employee.status} />
              <span className="text-sm text-muted-foreground">
                Joined {formatDate(employee.joiningDate)}
              </span>
            </div>
          </div>
        </div>
        {canEdit ? (
          <Button variant="outline" size="sm" asChild>
            <Link
              to="/employees/$employeeId/edit"
              params={{ employeeId: String(employee.id) }}
            >
              <Pencil />
              Edit
            </Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        <dl className="grid gap-5 sm:grid-cols-2">
          <DetailRow label="Email" value={employee.email} />
          <DetailRow label="Department" value={employee.department.name} />
          <DetailRow label="Job title" value={employee.jobTitle} />
          <DetailRow label="Employee ID" value={String(employee.id)} />
        </dl>
      </CardContent>
    </Card>
  )
}
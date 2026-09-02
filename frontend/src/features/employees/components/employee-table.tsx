import { Link } from '@tanstack/react-router'
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmploymentStatusBadge } from '@/components/ui/badge'
import type { EmployeeListSearch } from '@/features/employees/schemas/employee-list-params'
import type { Employee, EmployeeSortField } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface EmployeeTableProps {
  employees: Employee[]
  search: EmployeeListSearch
  canEdit: boolean
  onSortChange: (field: EmployeeSortField) => void
  onDeleteRequest: (employee: Employee) => void
}

function SortHeader({
  label,
  field,
  current,
  direction,
  onSortChange,
}: {
  label: string
  field: EmployeeSortField
  current: EmployeeSortField
  direction: 'asc' | 'desc'
  onSortChange: (field: EmployeeSortField) => void
}) {
  const active = current === field
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 font-medium text-muted-foreground transition-colors hover:text-foreground"
      onClick={() => onSortChange(field)}
      aria-label={`Sort by ${label.toLowerCase()}${
        active ? `, currently ${direction === 'asc' ? 'ascending' : 'descending'}` : ''
      }`}
    >
      {label}
      {active ? (
        direction === 'asc' ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5" />
        )
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
      )}
    </button>
  )
}

export function EmployeeTable({
  employees,
  search,
  canEdit,
  onSortChange,
  onDeleteRequest,
}: EmployeeTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <SortHeader
              label="Name"
              field="name"
              current={search.sort}
              direction={search.direction}
              onSortChange={onSortChange}
            />
          </TableHead>
          <TableHead className="hidden md:table-cell">Email</TableHead>
          <TableHead className="hidden sm:table-cell">Department</TableHead>
          <TableHead className="hidden lg:table-cell">Job title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <SortHeader
              label="Joining date"
              field="joiningDate"
              current={search.sort}
              direction={search.direction}
              onSortChange={onSortChange}
            />
          </TableHead>
          {canEdit ? <TableHead className="w-24 text-right">Actions</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell>
              <Link
                to="/employees/$employeeId"
                params={{ employeeId: String(employee.id) }}
                className="flex items-center gap-2 font-medium hover:underline"
              >
                {employee.fullName}
              </Link>
            </TableCell>
            <TableCell className="hidden md:table-cell">{employee.email}</TableCell>
            <TableCell className="hidden sm:table-cell">
              {employee.department.name}
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              {employee.jobTitle}
            </TableCell>
            <TableCell>
              <EmploymentStatusBadge status={employee.status} />
            </TableCell>
            <TableCell>{formatDate(employee.joiningDate)}</TableCell>
            {canEdit ? (
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${employee.fullName}`}
                    asChild
                  >
                    <Link
                      to="/employees/$employeeId/edit"
                      params={{ employeeId: String(employee.id) }}
                    >
                      <Pencil />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${employee.fullName}`}
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDeleteRequest(employee)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
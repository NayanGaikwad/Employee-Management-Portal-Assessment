import { zodSearchValidator } from '@tanstack/router-zod-adapter'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { ErrorState, EmptyState } from '@/components/layout/feedback'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { InlineLoader } from '@/components/ui/spinner'
import { Pagination } from '@/components/ui/pagination'
import { useToast } from '@/components/ui/toast'
import { DeleteEmployeeDialog } from '@/features/employees/components/delete-employee-dialog'
import { EmployeeFilters } from '@/features/employees/components/employee-filters'
import { EmployeeTable } from '@/features/employees/components/employee-table'
import {
  useDeleteEmployee,
  useEmployeesListQuery,
} from '@/features/employees/hooks/use-employees'
import { useDepartmentsQuery } from '@/features/departments/hooks/use-departments'
import {
  employeeListSearchSchema,
  type EmployeeListSearch,
} from '@/features/employees/schemas/employee-list-params'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import type { Employee, EmployeeSortField } from '@/lib/types'

export const Route = createFileRoute('/_authenticated/employees/')({
  validateSearch: zodSearchValidator(employeeListSearchSchema),
  component: EmployeesListPage,
})

function EmployeesListPage() {
  const navigate = useNavigate({ from: Route.fullPath })
  const search = Route.useSearch()
  const { isAdmin } = useAuth()
  const { toast } = useToast()
  const [pendingDelete, setPendingDelete] = useState<Employee | null>(null)

  const employeesQuery = useEmployeesListQuery(search)
  const departmentsQuery = useDepartmentsQuery()
  const deleteMutation = useDeleteEmployee()

  const canEdit = isAdmin

  const updateSearch = (patch: Partial<EmployeeListSearch>) => {
    void navigate({ search: (previous) => ({ ...previous, ...patch }) })
  }

  const handleSortChange = (field: EmployeeSortField) => {
    if (search.sort === field) {
      updateSearch({ page: 1, direction: search.direction === 'asc' ? 'desc' : 'asc' })
    } else {
      updateSearch({ page: 1, sort: field, direction: 'asc' })
    }
  }

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return
    const target = pendingDelete
    try {
      await deleteMutation.mutateAsync(target.id)
      setPendingDelete(null)
      const data = employeesQuery.data
      if (data && data.items.length === 1 && data.page > 1) {
        updateSearch({ page: data.page - 1 })
      }
    } catch (error) {
      toast({
        title: 'Could not deactivate employee',
        description:
          error instanceof ApiError ? error.friendlyMessage : undefined,
        variant: 'error',
      })
    }
  }

  const hasFilters =
    Boolean(search.search) ||
    search.departmentId !== undefined ||
    search.status !== undefined

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Search, filter and manage employees."
        actions={
          canEdit ? (
            <Button asChild>
              <Link to="/employees/new">
                <Plus />
                Add employee
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="mb-4 rounded-lg border p-3">
        <EmployeeFilters
          search={search}
          departments={departmentsQuery.data}
          departmentsLoading={departmentsQuery.isLoading}
          onChange={updateSearch}
        />
      </div>

      <Card>
        {employeesQuery.isPending && !employeesQuery.data ? (
          <CardContent className="p-6">
            <InlineLoader label="Loading employees…" />
          </CardContent>
        ) : employeesQuery.isError ? (
          <CardContent className="p-6">
            <ErrorState
              title="Could not load employees"
              description={employeeErrorMessage(employeesQuery.error)}
              onRetry={() => void employeesQuery.refetch()}
            />
          </CardContent>
        ) : employeesQuery.data.items.length === 0 ? (
          <CardContent className="p-6">
            <EmptyState
              title={hasFilters ? 'No employees match your filters' : 'No employees yet'}
              description={
                hasFilters
                  ? 'Try clearing the search or filters to see more records.'
                  : 'Add your first employee to get started.'
              }
              action={
                hasFilters ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate({
                        search: {
                          page: 1,
                          pageSize: search.pageSize,
                          sort: search.sort,
                          direction: search.direction,
                        },
                      })
                    }
                  >
                    Clear filters
                  </Button>
                ) : canEdit ? (
                  <Button asChild>
                    <Link to="/employees/new">
                      <Plus />
                      Add employee
                    </Link>
                  </Button>
                ) : undefined
              }
            />
          </CardContent>
        ) : (
          <>
            <EmployeeTable
              employees={employeesQuery.data.items}
              search={search}
              canEdit={canEdit}
              onSortChange={handleSortChange}
              onDeleteRequest={setPendingDelete}
            />
            <Pagination
              page={employeesQuery.data.page}
              totalPages={employeesQuery.data.totalPages}
              totalItems={employeesQuery.data.totalItems}
              pageSize={employeesQuery.data.pageSize}
              onPageChange={(page) => updateSearch({ page })}
            />
          </>
        )}
      </Card>

      <DeleteEmployeeDialog
        employee={pendingDelete}
        open={pendingDelete !== null}
        pending={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

function employeeErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.friendlyMessage
  if (error instanceof Error) return error.message
  return 'Please try again.'
}
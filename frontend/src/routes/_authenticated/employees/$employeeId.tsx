import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/employees/$employeeId')({
  component: EmployeeDetailLayout,
})

function EmployeeDetailLayout() {
  return <Outlet />
}
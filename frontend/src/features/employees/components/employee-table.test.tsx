import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { EmployeeTable } from '@/features/employees/components/employee-table'
import { DEFAULT_LIST_SEARCH } from '@/features/employees/schemas/employee-list-params'
import { employees } from '@/test/fixtures'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    params,
    className,
    children,
  }: {
    to: string
    params: Record<string, string>
    className?: string
    children: React.ReactNode
  }) => (
    <a
      href={`${to.replace('$employeeId', params.employeeId)}`}
      className={className}
    >
      {children}
    </a>
  ),
}))

function renderTable(overrides: { canEdit?: boolean } = {}) {
  const onSortChange = vi.fn()
  const onDeleteRequest = vi.fn()
  render(
    <EmployeeTable
      employees={employees}
      search={DEFAULT_LIST_SEARCH}
      canEdit={overrides.canEdit ?? true}
      onSortChange={onSortChange}
      onDeleteRequest={onDeleteRequest}
    />,
  )
  return { onSortChange, onDeleteRequest }
}

describe('EmployeeTable', () => {
  it('renders employee rows with expected fields', () => {
    renderTable()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getAllByText('Software Engineer')[0]).toBeInTheDocument()
  })

  it('shows status badges', () => {
    renderTable()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('omits action buttons for non-admin users', () => {
    renderTable({ canEdit: false })
    expect(screen.queryByLabelText('Edit Jane Doe')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Delete Jane Doe')).not.toBeInTheDocument()
  })

  it('requests a delete when the delete button is clicked', async () => {
    const { onDeleteRequest } = renderTable()
    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Delete Jane Doe'))
    expect(onDeleteRequest).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, fullName: 'Jane Doe' }),
    )
  })

  it('toggles sort when a sortable header is clicked', async () => {
    const { onSortChange } = renderTable()
    const user = userEvent.setup()
    const nameHeader = screen.getByRole('button', {
      name: /sort by name/i,
    })
    await user.click(nameHeader)
    expect(onSortChange).toHaveBeenCalledWith('name')
  })

  it('renders the joining date in a readable format', () => {
    renderTable()
    const row = screen.getByText('Jane Doe').closest('tr')
    expect(within(row!).getByText('15 Jan 2024')).toBeInTheDocument()
  })
})
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '@/components/ui/toast'
import {
  EmployeeForm,
} from '@/features/employees/components/employee-form'
import { departments, employees } from '@/test/fixtures'
import { renderWithProviders } from '@/test/helpers'

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ history: { back: vi.fn() }, navigate: vi.fn() }),
}))

vi.mock('@/features/employees/hooks/use-employees', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/features/employees/hooks/use-employees')>()
  const { vi: vitest } = await import('vitest')
  return {
    ...original,
    useCreateEmployee: () => ({
      isPending: false,
      mutateAsync: vitest.fn(),
    }),
    useUpdateEmployee: () => ({
      isPending: false,
      mutateAsync: vitest.fn(),
    }),
  }
})

function renderForm() {
  return renderWithProviders(
    <ToastProvider>
      <EmployeeForm
        mode="create"
        initialValues={{
          fullName: '',
          email: '',
          departmentId: NaN,
          jobTitle: '',
          status: 'ACTIVE',
          joiningDate: '',
        }}
        departments={departments}
      />
    </ToastProvider>,
  )
}

describe('EmployeeForm', () => {
  it('renders all required fields and the submit button', () => {
    renderForm()
    expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Job title *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create employee' })).toBeInTheDocument()
  })

  it('shows a validation error for an invalid email on blur', async () => {
    const user = userEvent.setup()
    renderForm()
    const email = screen.getByLabelText(/Email/i)
    await user.type(email, 'not-an-email')
    await user.tab()
    await waitFor(() =>
      expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument(),
    )
  })

  it('lists only active departments without a current selection', async () => {
    renderForm()
    await userEvent.setup().click(screen.getByLabelText('Department'))
    expect(await screen.findByRole('option', { name: 'Engineering' })).toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: 'Archived (Inactive)' }),
    ).not.toBeInTheDocument()
  })

  it('keeps an inactive department selectable when editing that employee', async () => {
    const employee = employees[0]
    const archived = departments[2]
    renderWithProviders(
      <ToastProvider>
        <EmployeeForm
          mode="edit"
          employeeId={employee.id}
          initialValues={{
            fullName: employee.fullName,
            email: employee.email,
            departmentId: archived.id,
            jobTitle: employee.jobTitle,
            status: employee.status,
            joiningDate: employee.joiningDate,
          }}
          departments={departments}
        />
      </ToastProvider>,
    )
    await userEvent.setup().click(screen.getByLabelText('Department'))
    expect(
      await screen.findByRole('option', { name: 'Archived (Inactive)' }),
    ).toBeInTheDocument()
  })
})
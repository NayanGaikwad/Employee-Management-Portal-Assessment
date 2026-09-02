import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { EmployeeFilters } from '@/features/employees/components/employee-filters'
import { DEFAULT_LIST_SEARCH } from '@/features/employees/schemas/employee-list-params'
import { departments } from '@/test/fixtures'

function renderFilters() {
  const onChange = vi.fn()
  render(
    <EmployeeFilters
      search={DEFAULT_LIST_SEARCH}
      departments={departments}
      departmentsLoading={false}
      onChange={onChange}
    />,
  )
  return { onChange }
}

describe('EmployeeFilters', () => {
  it('debounces search input into a filter change', async () => {
    const user = userEvent.setup()
    const { onChange } = renderFilters()
    const input = screen.getByLabelText(/search employees/i)
    await user.type(input, 'jane')
    await waitFor(
      () =>
        expect(onChange).toHaveBeenCalledWith({ search: 'jane', page: 1 }),
      { timeout: 1000 },
    )
  })

  it('clears search when the clear button is pressed', async () => {
    const user = userEvent.setup()
    const { onChange } = renderFilters()
    const input = screen.getByLabelText(/search employees/i)
    await user.type(input, 'abc')
    const clear = await screen.findByLabelText('Clear search')
    await user.click(clear)
    await waitFor(
      () =>
        expect(onChange).toHaveBeenCalledWith({ search: undefined, page: 1 }),
      { timeout: 1000 },
    )
  })

  it('lists departments in the department filter', async () => {
    const user = userEvent.setup()
    renderFilters()
    await user.click(screen.getByLabelText('Filter by department'))
    expect(
      await screen.findByRole('option', { name: 'Engineering' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('option', { name: 'Design' }),
    ).toBeInTheDocument()
  })

  it('filters by department on selection', async () => {
    const user = userEvent.setup()
    const { onChange } = renderFilters()
    await user.click(screen.getByLabelText('Filter by department'))
    await user.click(await screen.findByRole('option', { name: 'Design' }))
    expect(onChange).toHaveBeenCalledWith({ departmentId: 2, page: 1 })
  })

  it('filters by employment status on selection', async () => {
    const user = userEvent.setup()
    const { onChange } = renderFilters()
    await user.click(screen.getByLabelText('Filter by employment status'))
    await user.click(await screen.findByRole('option', { name: 'Inactive' }))
    expect(onChange).toHaveBeenCalledWith({ status: 'INACTIVE', page: 1 })
  })

  it('switches sort direction', async () => {
    const user = userEvent.setup()
    const { onChange } = renderFilters()
    await user.click(
      screen.getByRole('button', { name: /switch sort direction/i }),
    )
    expect(onChange).toHaveBeenCalledWith({ direction: 'desc', page: 1 })
  })
})
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmploymentStatusBadge } from '@/components/ui/badge'

describe('EmploymentStatusBadge', () => {
  it('renders an active employee as Active', () => {
    const { container } = render(<EmploymentStatusBadge status="ACTIVE" />)
    expect(container).toMatchSnapshot()
  })

  it('renders an inactive employee as Inactive', () => {
    const { container } = render(<EmploymentStatusBadge status="INACTIVE" />)
    expect(container).toMatchSnapshot()
  })
})
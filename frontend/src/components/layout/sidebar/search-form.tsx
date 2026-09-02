import { useNavigate } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import type * as React from 'react'
import { useState } from 'react'

import { Label } from '@/components/ui/label'
import { SidebarInput } from '@/components/ui/sidebar'

export function SearchForm({ ...props }: React.ComponentProps<'form'>) {
  const navigate = useNavigate()
  const [value, setValue] = useState('')

  return (
    <form
      {...props}
      onSubmit={(event) => {
        event.preventDefault()
        void navigate({
          to: '/employees',
          search: (prev) => ({ ...prev, search: value.trim() || undefined }),
        })
      }}
    >
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <SidebarInput
          id="search"
          placeholder="Search employees..."
          className="h-8 pl-7"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
      </div>
    </form>
  )
}
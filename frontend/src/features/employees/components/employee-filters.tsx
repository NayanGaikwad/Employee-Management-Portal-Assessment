import { ArrowDown, ArrowUp, ArrowUpDown, Search, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  EMPLOYMENT_STATUS_OPTIONS,
  type EmploymentStatus,
} from '@/features/employees/constants/status-options'
import type { EmployeeListSearch } from '@/features/employees/schemas/employee-list-params'
import type { Department, EmployeeSortField, SortDirection } from '@/lib/types'

interface EmployeeFiltersProps {
  search: EmployeeListSearch
  departments: Department[] | undefined
  departmentsLoading: boolean
  onChange: (
    patch: Partial<
      Pick<
        EmployeeListSearch,
        | 'search'
        | 'departmentId'
        | 'status'
        | 'sort'
        | 'direction'
        | 'page'
      >
    >,
  ) => void
}

const SORT_OPTIONS: Array<{ value: EmployeeSortField; label: string }> = [
  { value: 'name', label: 'Name' },
  { value: 'joiningDate', label: 'Joining date' },
]

const DIRECTION_LABEL: Record<SortDirection, string> = {
  asc: 'Ascending',
  desc: 'Descending',
}

function FieldShell({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex min-w-40 flex-1 flex-col gap-1.5 sm:min-w-44">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

export function EmployeeFilters({
  search,
  departments,
  departmentsLoading,
  onChange,
}: EmployeeFiltersProps) {
  // Local draft of the search box so keystrokes are immediate while the URL
  // search param updates on a debounce.
  const [searchInput, setSearchInput] = useState(search.search ?? '')
  const debounceRef = useRef<number | undefined>(undefined)

  // Keep the local draft in sync when the URL search param changes externally
  // (e.g. "clear filters"). Deliberate prop->state sync.
  useEffect(() => {
    setSearchInput(search.search ?? '')
  }, [search.search])

  useEffect(() => {
    return () => window.clearTimeout(debounceRef.current)
  }, [])

  const handleSearch = (value: string) => {
    setSearchInput(value)
    window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      onChange({ search: value || undefined, page: 1 })
    }, 300)
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <FieldShell label="Search">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search employees by name or email"
            placeholder="Name or email…"
            value={searchInput}
            onChange={(event) => handleSearch(event.target.value)}
            className="pl-9 pr-8"
          />
          {searchInput ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => handleSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </FieldShell>

      <FieldShell label="Department">
        <Select
          value={search.departmentId ? String(search.departmentId) : 'all'}
          onValueChange={(value) =>
            onChange({
              departmentId: value === 'all' ? undefined : Number(value),
              page: 1,
            })
          }
        >
          <SelectTrigger aria-label="Filter by department" className="min-w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {(departments ?? []).map((department) => (
              <SelectItem key={department.id} value={String(department.id)}>
                {department.name}
              </SelectItem>
            ))}
            {departmentsLoading ? (
              <SelectItem value="loading" disabled>
                Loading…
              </SelectItem>
            ) : null}
          </SelectContent>
        </Select>
      </FieldShell>

      <FieldShell label="Status">
        <Select
          value={search.status ?? 'all'}
          onValueChange={(value) =>
            onChange({
              status:
                value === 'all'
                  ? undefined
                  : (value as EmploymentStatus),
              page: 1,
            })
          }
        >
          <SelectTrigger aria-label="Filter by employment status" className="min-w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldShell>

      <FieldShell label="Sort by">
        <Select
          value={search.sort}
          onValueChange={(value) =>
            onChange({ sort: value as EmployeeSortField, page: 1 })
          }
        >
          <SelectTrigger aria-label="Sort employees by" className="min-w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldShell>

      <FieldShell label={DIRECTION_LABEL[search.direction]}>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          aria-label={`Switch sort direction (currently ${DIRECTION_LABEL[search.direction].toLowerCase()})`}
          onClick={() =>
            onChange({
              direction: search.direction === 'asc' ? 'desc' : 'asc',
              page: 1,
            })
          }
        >
          {search.direction === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
          {search.direction === 'asc' ? 'A → Z' : 'Z → A'}
          <ArrowUpDown className="ml-auto h-3.5 w-3.5 opacity-40" />
        </Button>
      </FieldShell>
    </div>
  )
}
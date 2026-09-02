import { cn } from '@/lib/utils'

/** Initials avatar for an employee or department. Deterministic colour from the name. */
export function EmployeeAvatar({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const initials = name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const palette = [
    'bg-sky-100 text-sky-800',
    'bg-violet-100 text-violet-800',
    'bg-emerald-100 text-emerald-800',
    'bg-amber-100 text-amber-800',
    'bg-rose-100 text-rose-800',
    'bg-cyan-100 text-cyan-800',
  ]
  const hash = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const color = palette[hash % palette.length]

  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
        color,
        className,
      )}
    >
      {initials || '·'}
    </div>
  )
}
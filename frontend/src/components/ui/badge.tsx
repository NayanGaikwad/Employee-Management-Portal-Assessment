import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import type { EmploymentStatus } from '@/features/employees/constants/status-options'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        success:
          'border-transparent bg-emerald-100 text-emerald-800',
        muted: 'border-transparent bg-slate-100 text-slate-600',
        warning:
          'border-transparent bg-amber-100 text-amber-800',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

const EMPLOYMENT_BADGE_VARIANTS: Record<EmploymentStatus, 'success' | 'muted'> = {
  ACTIVE: 'success',
  INACTIVE: 'muted',
}

export function EmploymentStatusBadge({ status }: { status: EmploymentStatus }) {
  const label = status === 'ACTIVE' ? 'Active' : 'Inactive'
  return <Badge variant={EMPLOYMENT_BADGE_VARIANTS[status]}>{label}</Badge>
}

export { Badge, badgeVariants }
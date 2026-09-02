import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/layout/feedback'
import type { RouterContext } from '@/app/router'

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: () => (
    <NotFoundPage />
  ),
  errorComponent: ({ error }) => <ErrorState title="Something went wrong" description={error instanceof Error ? error.message : undefined} />,
})

function RootComponent() {
  return <Outlet />
}

function NotFoundPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you were looking for does not exist or has moved.
        </p>
        <div className="mt-2 flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/employees">Back to employees</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
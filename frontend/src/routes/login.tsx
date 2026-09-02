import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { LoginForm } from '@/features/auth/components/login-form'
import { Button } from '@/components/ui/button'

const loginSearchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/login')({
  validateSearch: (search) => loginSearchSchema.parse(search),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect?.startsWith('/') ? search.redirect : '/employees' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const { redirect } = Route.useSearch()
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-muted/40 p-6">
      <LoginForm redirectTo={redirect} />
      <p className="text-sm text-muted-foreground">
        No account yet?{' '}
        <Button variant="link" className="h-auto p-0" asChild>
          <Link to="/register">Create one</Link>
        </Button>
      </p>
    </div>
  )
}
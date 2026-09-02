import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { RegisterForm } from '@/features/auth/components/register-form'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/register')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/employees' })
    }
  },
  component: RegisterPage,
})

function RegisterPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-muted/40 p-6">
      <RegisterForm />
      <p className="text-sm text-muted-foreground">
        Already have an account?{' '}
        <Button variant="link" className="h-auto p-0" asChild>
          <Link to="/login">Sign in</Link>
        </Button>
      </p>
    </div>
  )
}
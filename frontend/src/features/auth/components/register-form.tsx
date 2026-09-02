import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FieldError } from '@/components/ui/form-field'
import { registerRequest } from '@/features/auth/api/auth'
import { registerSchema } from '@/features/auth/schemas/auth-schema'
import { useAuth } from '@/lib/auth'
import { ApiError } from '@/lib/api'

export function RegisterForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (values: { email: string; password: string }) =>
      registerRequest(values.email, values.password),
    onSuccess: ({ accessToken, user }) => {
      login(accessToken, user)
      void navigate({ to: '/employees', replace: true })
    },
    onError: (error: unknown) => {
      setServerError(
        error instanceof ApiError ? error.friendlyMessage : 'Unable to create your account.',
      )
    },
  })

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: registerSchema },
    onSubmit: ({ value }) => mutation.mutate(value),
  })

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Create an account</CardTitle>
        <CardDescription>
          New accounts get read-only access. Administrators grant write
          permissions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          onSubmit={(event: FormEvent) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="email"
            validators={{ onBlur: registerSchema.shape.email }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={Boolean(field.state.meta.errors.length)}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{ onBlur: registerSchema.shape.password }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={Boolean(field.state.meta.errors.length)}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          {form.state.errors.length ? (
            <FieldError errors={form.state.errors} />
          ) : null}
          {serverError ? <FieldError errors={[serverError]} /> : null}

          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
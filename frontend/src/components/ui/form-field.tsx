import { createElement } from 'react'

export function FieldError({ errors }: { errors: unknown[] }) {
  const [first] = errors
  if (!first) return null
  const message =
    typeof first === 'string'
      ? first
      : first && typeof first === 'object' && 'message' in first
        ? String((first as { message: unknown }).message)
        : 'Invalid value.'

  return (
    <p role="alert" className="text-sm text-destructive">
      {createElement('span', null, message)}
    </p>
  )
}

export function ServerFieldError({ message }: { message?: string }) {
  if (!message) return null
  return <FieldError errors={[message]} />
}
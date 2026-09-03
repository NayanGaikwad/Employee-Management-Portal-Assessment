import { useEffect, useState, useCallback, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ColdStartGateProps {
  children: ReactNode
  pingPath?: string
  initialDelayMs?: number
  maxDelayMs?: number
  maxRetries?: number
}

export function ColdStartGate({
  children,
  pingPath = '/auth/login',
  initialDelayMs = 1000,
  maxDelayMs = 30_000,
  maxRetries = 60,
}: ColdStartGateProps) {
  const [ready, setReady] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [failed, setFailed] = useState(false)

  const API_BASE_URL: string =
    import.meta.env.VITE_API_BASE_URL ?? '/api'

  const ping = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}${pingPath}`, {
        method: 'GET',
        signal: AbortSignal.timeout(10_000),
      })
      // Any HTTP response (even 401/405) means the backend is alive
      if (res.ok || res.status > 0) {
        setReady(true)
      }
    } catch {
      // Network error or timeout — backend still cold
      return false
    }
    return true
  }, [pingPath, API_BASE_URL])

  useEffect(() => {
    if (ready) return

    let timeout: ReturnType<typeof setTimeout>
    let cancelled = false

    async function tryPing() {
      if (cancelled) return

      const ok = await ping()
      if (cancelled) return

      if (ok) {
        setReady(true)
        return
      }

      const nextAttempt = attempt + 1
      if (nextAttempt >= maxRetries) {
        setFailed(true)
        return
      }

      setAttempt(nextAttempt)
      const delay = Math.min(initialDelayMs * 2 ** attempt, maxDelayMs)
      timeout = setTimeout(tryPing, delay)
    }

    tryPing()

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [attempt, ready, ping, initialDelayMs, maxDelayMs, maxRetries])

  if (failed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <Loader2 className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Service unavailable
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            The backend server could not be reached. Please try again in a
            few minutes.
          </p>
          <button
            onClick={() => {
              setFailed(false)
              setAttempt(0)
            }}
            className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (ready) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="relative rounded-full bg-primary/10 p-5">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">
            Backend is warming up…
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            The server was idle and is restarting. This usually takes
            30–60 seconds.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

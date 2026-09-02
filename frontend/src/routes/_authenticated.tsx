import {
  createFileRoute,
  Outlet,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import { useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { useAuth } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: window.location.pathname + window.location.search },
      })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      void router.navigate({ to: '/login' })
    }
  }, [isAuthenticated, router])

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderResult } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { AuthProvider } from '@/lib/auth'

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface AppProvidersProps {
  children: ReactNode
  client?: QueryClient
}

function AppProviders({ children, client }: AppProvidersProps) {
  const queryClient = client ?? createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}

/** Renders a component with query + auth providers (no router). */
export function renderWithProviders(ui: ReactElement): RenderResult {
  return render(<AppProviders>{ui}</AppProviders>)
}
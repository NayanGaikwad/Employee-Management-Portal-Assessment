import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { router } from '@/app/router'
import { queryClient } from '@/app/query-client'
import { AuthProvider, useAuth } from '@/lib/auth'
import { ToastProvider } from '@/components/ui/toast'
import { ColdStartGate } from '@/components/cold-start-gate'
import '@/styles/globals.css'

function App() {
  const auth = useAuth()
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} context={{ auth }} />
      </ToastProvider>
    </QueryClientProvider>
  )
}

const rootElement = document.getElementById('root')!
createRoot(rootElement).render(
  <StrictMode>
    <ColdStartGate>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ColdStartGate>
  </StrictMode>,
)
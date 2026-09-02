import { createRouter } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen'
import type { AuthContextValue } from '@/lib/auth'

export interface RouterContext {
  auth: AuthContextValue
}

export const router = createRouter({
  routeTree,
  context: undefined as unknown as RouterContext,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
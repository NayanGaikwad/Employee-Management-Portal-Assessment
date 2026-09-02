import { api } from '@/lib/api'
import type { AuthResponse } from '@/lib/types'

export function loginRequest(email: string, password: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/login', { email, password })
}

export function registerRequest(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/register', { email, password })
}
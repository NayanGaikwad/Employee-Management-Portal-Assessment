export const ADMIN_EMAIL = 'admin@example.com'
export const ADMIN_PASSWORD = 'Admin@12345'

export function randomSuffix(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}`
}
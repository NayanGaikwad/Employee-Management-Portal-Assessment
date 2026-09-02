import { expect, test } from '@playwright/test'
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './helpers'

// Force a fresh, logged-out browser for these journeys.
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('authentication', () => {
  test('redirects unauthenticated visitors to the login page', async ({ page }) => {
    await page.goto('/employees')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('logs in with valid credentials and lands on employees', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', ADMIN_EMAIL)
    await page.fill('input[name="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/employees/)
    await expect(
      page.getByRole('heading', { name: 'Employees', level: 1 }),
    ).toBeVisible()
    await expect(page.locator('table tbody tr').first()).toBeVisible()
  })

  test('shows an error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'nobody@example.com')
    await page.fill('input[name="password"]', 'wrong-password')
    await page.click('button[type="submit"]')
    await expect(page.getByText(/invalid|incorrect|credentials/i)).toBeVisible()
  })
})
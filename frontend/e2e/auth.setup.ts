import { test as setup, expect } from '@playwright/test'
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './helpers'

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name="email"]', ADMIN_EMAIL)
  await page.fill('input[name="password"]', ADMIN_PASSWORD)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/employees/)
  await page.context().storageState({
    path: 'e2e/.auth/admin.json',
  })
})
import { expect, test } from '@playwright/test'

test.describe('departments', () => {
  test('lists departments with status badges', async ({ page }) => {
    await page.goto('/departments')
    await expect(
      page.getByRole('heading', { name: 'Departments', level: 1 }),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Engineering' })).toBeVisible()
    await expect(
      page.locator('table tbody tr').first().getByText('Active'),
    ).toBeVisible()
  })

  test('opens a department detail page', async ({ page }) => {
    await page.goto('/departments')
    await page.getByRole('link', { name: 'Engineering' }).click()
    await expect(page).toHaveURL(/\/departments\/\d+$/)
    await expect(page.getByText('Engineering')).toBeVisible()
  })
})
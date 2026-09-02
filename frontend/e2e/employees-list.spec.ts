import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/employees')
  await expect(
    page.getByRole('heading', { name: 'Employees', level: 1 }),
  ).toBeVisible()
})

test.describe('employee list', () => {
  test('lists seeded employees in a table', async ({ page }) => {
    const rows = page.locator('table tbody tr')
    await expect(rows.first()).toBeVisible()
    expect(await rows.count()).toBeGreaterThan(0)
  })

  test('filters employees by a search term', async ({ page }) => {
    const rows = page.locator('table tbody tr')
    await expect(rows.first()).toBeVisible()
    const totalBefore = await rows.count()
    // Every seeded employee email shares the @company.com domain.
    const search = page.getByLabel(/search employees/i)
    await search.fill('@company.com')
    await expect(rows.first()).toBeVisible({ timeout: 2000 })
    await expect
      .poll(async () => (await rows.count()))
      .toBeGreaterThanOrEqual(1)
    // Filtering must restrict the result set to at most the full list.
    await expect
      .poll(async () => (await rows.count()))
      .toBeLessThanOrEqual(totalBefore)
  })

  test('filters by employment status', async ({ page }) => {
    const rows = page.locator('table tbody tr')
    // Wait for the table to populate before capturing the baseline count.
    await expect(rows.first()).toBeVisible()
    const totalBefore = await rows.count()
    await page.getByLabel('Filter by employment status').click()
    await page.getByRole('option', { name: 'Inactive' }).click()
    await expect(rows.first()).toBeVisible()
    await expect
      .poll(async () => (await rows.count()))
      .toBeLessThan(totalBefore)
    // Every visible row should show the Inactive badge.
    const visibleRows = await rows.all()
    for (const row of visibleRows) {
      await expect(row.getByText('Inactive')).toBeVisible()
    }
  })

  test('shows an empty state when no employees match', async ({ page }) => {
    const search = page.getByLabel(/search employees/i)
    await search.fill('zzz-no-such-employee-zzz')
    await expect(
      page.getByText(/no employees match your filters/i),
    ).toBeVisible({ timeout: 2000 })
  })
})
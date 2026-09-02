import { expect, test } from '@playwright/test'
import { randomSuffix } from './helpers'

const NAME = `E2E Employee ${randomSuffix()}`

test.describe('employee management (admin)', () => {
  test('creates a new employee and shows it in the list', async ({ page }) => {
    await page.goto('/employees')
    await page.getByRole('link', { name: 'Add employee' }).click()
    await expect(page).toHaveURL(/\/employees\/new/)

    await page.fill('input[name="fullName"]', NAME)
    await page.fill('input[name="email"]', `e2e-${randomSuffix()}@example.com`)
    await page.getByLabel('Department').click()
    await page.getByRole('option', { name: 'Engineering' }).click()
    await page.fill('input[name="jobTitle"]', 'QA Engineer')
    await page.fill('input[name="joiningDate"]', '2026-01-01')
    await page.getByRole('button', { name: 'Create employee' }).click()

    await expect(page).toHaveURL(new RegExp(`/employees/\\d+$`))
    await expect(page.getByText(NAME).first()).toBeVisible()
  })

  test('validates required fields before submit', async ({ page }) => {
    await page.goto('/employees/new')
    await page.getByRole('button', { name: 'Create employee' }).click()
    await expect(page.getByText('Full name is required.')).toBeVisible()
    // Validation blocks navigation to the create route.
    await expect(page).toHaveURL(/\/employees\/new$/)
  })

  test('reports a duplicate email address', async ({ page }) => {
    await page.goto('/employees/new')
    await page.fill('input[name="fullName"]', NAME)
    // ava.turner@company.com already exists as a seeded employee.
    await page.fill('input[name="email"]', 'ava.turner@company.com')
    await page.getByLabel('Department').click()
    await page.getByRole('option', { name: 'Engineering' }).click()
    await page.fill('input[name="jobTitle"]', 'QA Engineer')
    await page.fill('input[name="joiningDate"]', '2026-01-01')
    await page.getByRole('button', { name: 'Create employee' }).click()
    await expect(
      page.getByText(/already in use|already exists/i).first(),
    ).toBeVisible()
  })

  test('edits an existing employee', async ({ page }) => {
    await page.goto('/employees')
    // Open the first employee row's edit action. The Edit control is a Link
    // (Button asChild), so it queries as a link role.
    await page
      .locator('table tbody tr')
      .first()
      .getByRole('link', { name: /^Edit / })
      .first()
      .click()
    await expect(page).toHaveURL(/\/employees\/\d+\/edit$/)

    const jobTitle = page.locator('input[name="jobTitle"]')
    const updated = `Updated Title ${randomSuffix()}`
    await jobTitle.fill('')
    await jobTitle.fill(updated)
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(page).toHaveURL(new RegExp(`/employees/\\d+$`))
    await expect(page.getByText(updated)).toBeVisible()
  })

  test('soft-deletes an employee via the confirmation dialog', async ({ page }) => {
    // Create a unique record first so the journey is self-contained and does
    // not mutate shared seed data (tests may run in parallel).
    const deleteName = `To Delete ${randomSuffix()}`
    await page.goto('/employees/new')
    await page.fill('input[name="fullName"]', deleteName)
    await page.fill('input[name="email"]', `todelete-${randomSuffix()}@example.com`)
    await page.getByLabel('Department').click()
    await page.getByRole('option', { name: 'Engineering' }).click()
    await page.fill('input[name="jobTitle"]', 'QA Engineer')
    await page.fill('input[name="joiningDate"]', '2026-01-01')
    await page.getByRole('button', { name: 'Create employee' }).click()
    await expect(page).toHaveURL(new RegExp(`/employees/\\d+$`))

    // Return to the list and use the search box to surface the new record,
    // since it may not be on the default first page.
    await page.getByRole('link', { name: 'Back to employees' }).click()
    await expect(page).toHaveURL(/\/employees/)
    await page.getByLabel(/search employees/i).fill(deleteName.slice(0, 10))
    const row = page.locator(`table tbody tr:has-text("${deleteName}")`).first()
    await expect(row).toBeVisible({ timeout: 5000 })

    await row.getByRole('button', { name: /^Delete / }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', /deactivate/i)).toBeVisible()
    await expect(dialog.getByText(deleteName)).toBeVisible()
    await dialog
      .getByRole('button', { name: /^Deactivate$/ })
      .click()
    // Confirm the deleted employee no longer appears in the list.
    await expect
      .poll(
        async () =>
          (await page.locator(`table tbody tr:has-text("${deleteName}")`).count()) ===
          0,
        { timeout: 5000 },
      )
      .toBe(true)
  })
})
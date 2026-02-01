import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should display landing page', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /laurenzo private intelligence/i })).toBeVisible()
    await expect(page.getByText(/private markets intelligence platform/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /get started/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()
  })

  test('should navigate to login from landing page', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: /sign in/i }).click()

    await expect(page).toHaveURL('/login')
  })

  test('should navigate to signup from landing page', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: /get started/i }).click()

    await expect(page).toHaveURL('/signup')
  })

  test('should have responsive layout', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /laurenzo private intelligence/i })).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /laurenzo private intelligence/i })).toBeVisible()
  })
})

test.describe('Dashboard Navigation (requires auth mock)', () => {
  // These tests would require mocking the authentication state
  // In a real implementation, you would set up test users and auth tokens

  test.skip('should display dashboard sidebar navigation', async ({ page }) => {
    // This test is skipped because it requires authentication
    await page.goto('/dashboard')

    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /companies/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /real estate/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /tracked assets/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /settings/i })).toBeVisible()
  })

  test.skip('should navigate between dashboard sections', async ({ page }) => {
    await page.goto('/dashboard')

    await page.getByRole('link', { name: /companies/i }).click()
    await expect(page).toHaveURL('/dashboard/companies')

    await page.getByRole('link', { name: /real estate/i }).click()
    await expect(page).toHaveURL('/dashboard/real-estate')

    await page.getByRole('link', { name: /settings/i }).click()
    await expect(page).toHaveURL('/dashboard/settings')
  })
})

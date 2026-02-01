import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies()
  })

  test('should display login page', async ({ page }) => {
    await page.goto('/login')

    await expect(page).toHaveTitle(/Laurenzo Private Intelligence/)
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('should display signup page', async ({ page }) => {
    await page.goto('/signup')

    await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible()
    await expect(page.getByLabel(/full name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByLabel(/confirm password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
  })

  test('should show validation errors for empty login form', async ({ page }) => {
    await page.goto('/login')

    await page.getByRole('button', { name: /sign in/i }).click()

    // HTML5 validation should prevent submission
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toBeFocused()
  })

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel(/email/i).fill('invalid-email')
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()

    // HTML5 validation should show error
    const emailInput = page.getByLabel(/email/i)
    const isValid = await emailInput.evaluate((input: HTMLInputElement) => input.validity.valid)
    expect(isValid).toBe(false)
  })

  test('should show password mismatch error on signup', async ({ page }) => {
    await page.goto('/signup')

    await page.getByLabel(/full name/i).fill('Test User')
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByLabel(/confirm password/i).fill('different123')
    await page.getByRole('button', { name: /create account/i }).click()

    // Should show toast error
    await expect(page.getByText(/passwords do not match/i)).toBeVisible()
  })

  test('should navigate to signup from login', async ({ page }) => {
    await page.goto('/login')

    await page.getByRole('link', { name: /sign up/i }).click()

    await expect(page).toHaveURL('/signup')
    await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible()
  })

  test('should navigate to login from signup', async ({ page }) => {
    await page.goto('/signup')

    await page.getByRole('link', { name: /sign in/i }).click()

    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
  })

  test('should display password reset page', async ({ page }) => {
    await page.goto('/reset-password')

    await expect(page.getByRole('heading', { name: /reset your password/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible()
  })

  test('should navigate to password reset from login', async ({ page }) => {
    await page.goto('/login')

    await page.getByRole('link', { name: /forgot password/i }).click()

    await expect(page).toHaveURL('/reset-password')
  })

  test('should redirect unauthenticated users from dashboard', async ({ page }) => {
    await page.goto('/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })
})

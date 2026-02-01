import { test, expect } from '@playwright/test'

// Visual regression tests for key pages and components
// These tests capture screenshots and compare against baseline images

test.describe('Visual Regression Tests', () => {
  test.describe('Landing Page', () => {
    test('landing page matches snapshot', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot('landing-page.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      })
    })

    test('landing page hero section', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const hero = page.locator('section').first()
      await expect(hero).toHaveScreenshot('landing-hero.png', {
        maxDiffPixelRatio: 0.01,
      })
    })

    test('landing page pricing section', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Scroll to pricing section
      await page.locator('text=Pricing').first().click()
      await page.waitForTimeout(500) // Wait for smooth scroll

      const pricing = page.locator('[data-testid="pricing-section"]').or(
        page.locator('section:has-text("Professional")')
      )

      if (await pricing.count() > 0) {
        await expect(pricing.first()).toHaveScreenshot('landing-pricing.png', {
          maxDiffPixelRatio: 0.01,
        })
      }
    })
  })

  test.describe('Authentication Pages', () => {
    test('login page matches snapshot', async ({ page }) => {
      await page.goto('/auth/login')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot('login-page.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      })
    })

    test('signup page matches snapshot', async ({ page }) => {
      await page.goto('/auth/signup')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot('signup-page.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      })
    })

    test('login form in focus state', async ({ page }) => {
      await page.goto('/auth/login')
      await page.waitForLoadState('networkidle')

      const emailInput = page.getByLabel(/email/i)
      await emailInput.focus()

      const form = page.locator('form')
      await expect(form).toHaveScreenshot('login-form-focused.png', {
        maxDiffPixelRatio: 0.01,
      })
    })

    test('login form with validation errors', async ({ page }) => {
      await page.goto('/auth/login')
      await page.waitForLoadState('networkidle')

      // Submit empty form to trigger validation
      await page.getByRole('button', { name: /sign in|log in/i }).click()
      await page.waitForTimeout(300) // Wait for validation to appear

      const form = page.locator('form')
      await expect(form).toHaveScreenshot('login-form-errors.png', {
        maxDiffPixelRatio: 0.02,
      })
    })
  })

  test.describe('Dashboard Pages', () => {
    // Mock authenticated state for dashboard tests
    test.beforeEach(async ({ page }) => {
      // Set mock auth cookie/token
      await page.addInitScript(() => {
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'mock-token',
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
        }))
      })
    })

    test('dashboard overview matches snapshot', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot('dashboard-overview.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      })
    })

    test('companies list page', async ({ page }) => {
      await page.goto('/dashboard/companies')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot('companies-list.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      })
    })

    test('real estate list page', async ({ page }) => {
      await page.goto('/dashboard/real-estate')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot('real-estate-list.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      })
    })

    test('tracked assets page', async ({ page }) => {
      await page.goto('/dashboard/tracked')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot('tracked-assets.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      })
    })

    test('settings page', async ({ page }) => {
      await page.goto('/dashboard/settings')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot('settings-page.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      })
    })
  })

  test.describe('Component Visual Tests', () => {
    test('navigation sidebar', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      const nav = page.getByRole('navigation')
      if (await nav.count() > 0) {
        await expect(nav.first()).toHaveScreenshot('navigation-sidebar.png', {
          maxDiffPixelRatio: 0.01,
        })
      }
    })

    test('company card component', async ({ page }) => {
      await page.goto('/dashboard/companies')
      await page.waitForLoadState('networkidle')

      const card = page.locator('[data-testid="company-card"]').or(
        page.locator('.rounded-lg.border').first()
      )

      if (await card.count() > 0) {
        await expect(card.first()).toHaveScreenshot('company-card.png', {
          maxDiffPixelRatio: 0.01,
        })
      }
    })

    test('property card component', async ({ page }) => {
      await page.goto('/dashboard/real-estate')
      await page.waitForLoadState('networkidle')

      const card = page.locator('[data-testid="property-card"]').or(
        page.locator('.rounded-lg.border').first()
      )

      if (await card.count() > 0) {
        await expect(card.first()).toHaveScreenshot('property-card.png', {
          maxDiffPixelRatio: 0.01,
        })
      }
    })

    test('search form component', async ({ page }) => {
      await page.goto('/dashboard/companies')
      await page.waitForLoadState('networkidle')

      const searchForm = page.getByRole('search').or(
        page.locator('input[placeholder*="Search"]').locator('..')
      )

      if (await searchForm.count() > 0) {
        await expect(searchForm.first()).toHaveScreenshot('search-form.png', {
          maxDiffPixelRatio: 0.01,
        })
      }
    })

    test('filter dropdown component', async ({ page }) => {
      await page.goto('/dashboard/companies')
      await page.waitForLoadState('networkidle')

      // Open filter dropdown if exists
      const filterButton = page.getByRole('button', { name: /filter/i })
      if (await filterButton.count() > 0) {
        await filterButton.click()
        await page.waitForTimeout(300)

        const dropdown = page.locator('[role="listbox"]').or(
          page.locator('[data-testid="filter-dropdown"]')
        )

        if (await dropdown.count() > 0) {
          await expect(dropdown.first()).toHaveScreenshot('filter-dropdown.png', {
            maxDiffPixelRatio: 0.01,
          })
        }
      }
    })
  })

  test.describe('Responsive Visual Tests', () => {
    test('landing page mobile view', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 }) // iPhone X
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot('landing-mobile.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      })
    })

    test('landing page tablet view', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }) // iPad
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot('landing-tablet.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      })
    })

    test('dashboard mobile view', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot('dashboard-mobile.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      })
    })

    test('dashboard tablet view', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot('dashboard-tablet.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      })
    })
  })

  test.describe('Dark Mode Visual Tests', () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' })
    })

    test('landing page dark mode', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot('landing-dark.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      })
    })

    test('login page dark mode', async ({ page }) => {
      await page.goto('/auth/login')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot('login-dark.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      })
    })

    test('dashboard dark mode', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot('dashboard-dark.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      })
    })
  })

  test.describe('Hover and Interaction States', () => {
    test('button hover states', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const button = page.getByRole('button').or(page.getByRole('link')).first()
      await button.hover()

      await expect(button).toHaveScreenshot('button-hover.png', {
        maxDiffPixelRatio: 0.01,
      })
    })

    test('card hover state', async ({ page }) => {
      await page.goto('/dashboard/companies')
      await page.waitForLoadState('networkidle')

      const card = page.locator('.rounded-lg.border').first()
      if (await card.count() > 0) {
        await card.hover()
        await page.waitForTimeout(200)

        await expect(card).toHaveScreenshot('card-hover.png', {
          maxDiffPixelRatio: 0.02,
        })
      }
    })

    test('input focus states', async ({ page }) => {
      await page.goto('/auth/login')
      await page.waitForLoadState('networkidle')

      const input = page.getByLabel(/email/i)
      await input.focus()

      await expect(input).toHaveScreenshot('input-focus.png', {
        maxDiffPixelRatio: 0.01,
      })
    })
  })
})

import { test, expect } from '@playwright/test'

test.describe('MoonOS', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh (trigger onboarding)
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('shows onboarding on first visit', async ({ page }) => {
    await expect(page.getByText('Welcome to MoonOS')).toBeVisible()
  })

  test('completes onboarding flow', async ({ page }) => {
    // Step 1: Welcome - click Continue
    await page.getByRole('button', { name: 'Continue' }).click()
    // Step 2: Name
    await page.getByPlaceholder('My Workspace').fill('Test OS')
    await page.getByRole('button', { name: 'Next' }).first().click()
    // Step 3: Theme - click Next
    await page.getByRole('button', { name: 'Next' }).first().click()
    // Step 4: Launch
    await page.getByRole('button', { name: 'Launch MoonOS' }).click()
    // Should now be on desktop (dock visible)
    await page.waitForTimeout(500)
    await expect(page.locator('button:has-text("⬛")')).toBeVisible()
  })

  test('skip onboarding goes to desktop', async ({ page }) => {
    await page.getByText('Skip →').click()
    // Desktop should have the dock and panel
    await expect(page.locator('[class*="absolute bottom"]')).toBeVisible()
  })

  test('opens app from dock after onboarding', async ({ page }) => {
    // Skip onboarding
    await page.getByText('Skip →').click()
    // Wait for dock to render
    await page.waitForTimeout(300)
    // Click on Terminal icon (⬛)
    await page.locator('button:has-text("⬛")').click()
    // Terminal should be visible
    await expect(page.getByText('MoonOS Terminal')).toBeVisible()
  })

  test('launcher opens with Ctrl+Space', async ({ page }) => {
    await page.getByText('Skip →').click()
    await page.waitForTimeout(300)
    await page.keyboard.press('Control+ ')
    await expect(page.getByPlaceholder('Search apps...')).toBeVisible()
  })

  test('command palette opens with Ctrl+K', async ({ page }) => {
    await page.getByText('Skip →').click()
    await page.waitForTimeout(300)
    await page.keyboard.press('Control+k')
    await expect(page.getByPlaceholder('Type a command...')).toBeVisible()
  })

  test('theme toggles between dark and light', async ({ page }) => {
    await page.getByText('Skip →').click()
    await page.waitForTimeout(300)
    // Click theme toggle in top panel
    const themeBtn = page.locator('button:has-text("☀️"), button:has-text("🌙")').first()
    await themeBtn.click()
    // Check that data-theme attribute changed
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
    expect(theme).toBe('light')
  })

  test('workspace switching with Ctrl+2', async ({ page }) => {
    await page.getByText('Skip →').click()
    await page.waitForTimeout(300)
    await page.keyboard.press('Control+2')
    await expect(page.getByText('Desktop 2')).toBeVisible()
  })

  test('window can be opened and exists', async ({ page }) => {
    await page.getByText('Skip →').click()
    await page.waitForTimeout(300)
    // Open terminal from dock
    await page.locator('button:has-text("⬛")').click()
    await page.waitForTimeout(500)
    // Terminal should be visible with its content
    await expect(page.getByText('MoonOS Terminal')).toBeVisible()
  })
})

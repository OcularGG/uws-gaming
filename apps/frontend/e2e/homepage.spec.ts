import { test, expect } from '@playwright/test';

test.describe('HomePage', () => {
  test('should display the homepage correctly', async ({ page }) => {
    await page.goto('/');

    // Check if the main heading is visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Check if the page contains KrakenGaming text
    await expect(page.getByText('KrakenGaming')).toBeVisible();

    // Check if there's a call-to-action button
    await expect(page.getByRole('button', { name: /get started/i })).toBeVisible();
  });

  test('should navigate to legal page', async ({ page }) => {
    await page.goto('/');

    // Look for legal link in footer or navigation
    const legalLink = page.getByRole('link', { name: /legal/i }).first();
    if (await legalLink.isVisible()) {
      await legalLink.click();
      await expect(page).toHaveURL(/\/legal/);
      await expect(page.getByText(/legal/i)).toBeVisible();
    }
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check for basic meta tags
    await expect(page).toHaveTitle(/KrakenGaming/);

    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /.+/);
  });

  test('should be responsive', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

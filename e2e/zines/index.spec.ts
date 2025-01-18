import { test, expect } from '@playwright/test';

test.describe('Zines Pages', () => {
  test('displays zines grid when zines are available', async ({ page }) => {
    await page.goto('/zines');
    await expect(page.locator('[role="grid"]')).toBeVisible();
  });
});

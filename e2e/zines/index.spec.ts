import it from '@playwright/test';

it.describe('Zines Pages', () => {
  it('displays zines grid when zines are available', async ({ page }) => {
    await page.goto('/zines');
    await it.expect(page.locator('[role="grid"]')).toBeVisible();
  });
});

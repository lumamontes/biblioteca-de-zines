import { test, expect } from '@playwright/test';

test.describe('comparison lab real-source smoke', () => {
  test('loads the provided Drive PDF through the local proxy and reports its page count', async ({ page, request }) => {
    const response = await request.get('/api/google-drive/1nPD9vfTuJeVkTiLLN0FmLOjGLMmESKzM');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('application/pdf');
    expect((await response.body()).subarray(0, 4).toString()).toBe('%PDF');

    await page.goto('/');
    await expect(page.getByText('8', { exact: true })).toBeVisible({ timeout: 120_000 });
    await expect(page.getByText('PDF.js loaded and rendered every page')).toBeVisible();
  });

  test('initializes React PageFlip, direct PageFlip, and stable slide over the same PDF pages', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Page 1 / 8')).toBeVisible({ timeout: 120_000 });

    await page.getByRole('tab', { name: /Direct PageFlip/ }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Page 2 / 8')).toBeVisible();

    await page.getByRole('tab', { name: /React PageFlip/ }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Page 2 / 8')).toBeVisible();

    await page.getByRole('tab', { name: /Stable slide/ }).click();
    await expect(page.locator('.slide-page')).toBeVisible();
  });

  test('initializes BookReader with the same PDF-rendered page images', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('PDF.js loaded and rendered every page')).toBeVisible({ timeout: 120_000 });
    await page.getByRole('tab', { name: /Internet Archive BookReader/ }).click();
    await expect(page.locator('.BRcontrols')).toBeAttached({ timeout: 30_000 });
  });

  test('keeps the intentionally broken source separate and exposes the slide fallback', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Broken source/ }).click();
    await expect(page.getByText('Source unavailable')).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Use stable slide' }).click();
    await expect(page.getByRole('tab', { name: /Stable slide/ })).toHaveAttribute('aria-selected', 'true');
  });
});

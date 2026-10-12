import { test, expect } from '@playwright/test';

test.describe('comparison lab real-source smoke', () => {
  test('preloads the real ordered image set and turns exactly one page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('12', { exact: true })).toBeVisible({ timeout: 120_000 });
    await expect(page.getByText('Browser image requests completed')).toBeVisible();
    await page.getByRole('tab', { name: /Direct PageFlip/ }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Page 2 / 12')).toBeVisible();
  });

  test('runs the React PageFlip adapter over the same materialized images', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('12', { exact: true })).toBeVisible({ timeout: 120_000 });
    await page.getByRole('tab', { name: /React PageFlip/ }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Page 2 / 12')).toBeVisible();
  });

  test('loads the real external PDF through PDF.js before using BookReader', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /The Borderline Literary Magazine/ }).click();
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

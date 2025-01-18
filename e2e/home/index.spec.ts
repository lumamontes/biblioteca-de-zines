import { siteExternalLinks } from '@/app/config/site';
import { test, expect, Page } from '@playwright/test';

const EXPECTED_TITLE = 'Biblioteca de Zines';
const LINK_TEXT_EXPLORE = 'Explorar :)';
const LINK_TEXT_NEWSLETTER = 'Newsletter';
const LINK_TEXT_SUBMIT = 'Sugerir Zine';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(EXPECTED_TITLE);
  });

  test('has correct content', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText(EXPECTED_TITLE);
    await expect(page.getByRole('link', { name: LINK_TEXT_EXPLORE })).toBeVisible();
    await expect(page.getByRole('link', { name: LINK_TEXT_NEWSLETTER })).toBeVisible();
    await expect(page.getByRole('link', { name: LINK_TEXT_SUBMIT })).toBeVisible();
  });

  test('explore button navigates to the zines page', async ({ page }) => {
    await page.click(`text=${LINK_TEXT_EXPLORE}`);
    await expect(page).toHaveURL('/zines');
    await expect(page.locator('.grid')).toBeVisible();
  });

  test('home navigates correctly to external links', async ({ page }) => {
    await verifyLink(page, LINK_TEXT_NEWSLETTER, siteExternalLinks.NEWSLETTER);
    await verifyLink(page, LINK_TEXT_SUBMIT, siteExternalLinks.SUBMISSIONS_FORM);
  });
});

async function verifyLink(page: Page, name: string, href: string): Promise<void> {
  const link = page.getByRole('link', { name });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', href);
}

import { siteExternalLinks } from '@/app/config/site';
import it, { Page} from '@playwright/test';
const EXPECTED_TITLE = 'Biblioteca de Zines';
const LINK_TEXT_EXPLORE = 'Explorar :)';
const LINK_TEXT_NEWSLETTER = 'Newsletter';
const LINK_TEXT_SUBMIT = 'Sugerir Zine';

it.describe('Homepage', () => {
  it.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  it('has correct title', async ({ page }) => {
    await it.expect(page).toHaveTitle(EXPECTED_TITLE);
  });

  it('has correct content', async ({ page }) => {
    await it.expect(page.locator('h1')).toHaveText(EXPECTED_TITLE);
    await it.expect(page.getByRole('link', { name: LINK_TEXT_EXPLORE })).toBeVisible();
    await it.expect(page.getByRole('link', { name: LINK_TEXT_NEWSLETTER })).toBeVisible();
    await it.expect(page.getByRole('link', { name: LINK_TEXT_SUBMIT })).toBeVisible();
  });

  it('has a explore button that navigates to the zines page', async ({ page }) => {
    await page.click(`text=${LINK_TEXT_EXPLORE}`);
    await it.expect(page).toHaveURL('/zines');
    await it.expect(page.locator('.grid')).toBeVisible();
  });

  it('navigates correctly to external links', async ({ page }) => {
    await verifyLink(page, LINK_TEXT_NEWSLETTER, siteExternalLinks.NEWSLETTER);
    await verifyLink(page, LINK_TEXT_SUBMIT, siteExternalLinks.SUBMISSIONS_FORM);
  });
});

async function verifyLink(page: Page, name: string, href: string): Promise<void> {
  const link = page.getByRole('link', { name });
  await it.expect(link).toBeVisible();
  await it.expect(link).toHaveAttribute('href', href);
}

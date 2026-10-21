import it from '@playwright/test';

it.describe('/zines/[slug] Page', () => {
  const validZineSlug = 'luana-goes-girlhood';
  const invalidZineSlug = 'invalid-slug';

  it('renders zine details for a valid slug', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/zines/${validZineSlug}`);
    await it.expect(page.getByRole('complementary').locator('p').filter({ hasText: 'girlhood' }).first()).toBeVisible();
    await it.expect(page.getByRole('link', { name: 'Conhecer autor: Luana Góes' })).toBeVisible();
    await it.expect(page.getByRole('complementary')).toBeVisible();
    await it.expect(page.getByRole('button', { name: 'Recolher informações da zine' })).toHaveAttribute('aria-expanded', 'true');
    const expandedWidth = await page.locator('#pdfviewer').boundingBox();

    await page.getByRole('button', { name: 'Recolher informações da zine' }).click();
    await it.expect(page.getByRole('button', { name: 'Mostrar informações da zine' })).toHaveAttribute('aria-expanded', 'false');
    const collapsedWidth = await page.locator('#pdfviewer').boundingBox();
    await it.expect(collapsedWidth?.width ?? 0).toBeGreaterThan(expandedWidth?.width ?? 0);
  });

  it('keeps the reading layout within the viewport on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/zines/${validZineSlug}`);

    await it.expect(page.getByRole('complementary')).toBeVisible();
    await it.expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  it('displays error message for an invalid slug', async ({ page }) => {
    await page.goto(`/zines/${invalidZineSlug}`);
    await it.expect(page.locator('text=Ops! Parece que algo deu errado')).toBeVisible();
    await it.expect(page.locator('text=Voltar para a página inicial')).toBeVisible();

    await page.click('text=Voltar para a página inicial');
    await it.expect(page).toHaveURL('/');
    await it.expect(page.locator('h1:text("Biblioteca de Zines")')).toBeVisible();
  });


});

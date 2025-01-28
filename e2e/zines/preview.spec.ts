import it from '@playwright/test';

it.describe('/zines/[slug] Page', () => {
  const validZineSlug = 'luana-goes-girlhood';
  const invalidZineSlug = 'invalid-slug';

  it('renders zine details for a valid slug', async ({ page }) => {
    await page.goto(`/zines/${validZineSlug}`);
    await it.expect(page.locator('text=girlhood')).toBeVisible();
    await it.expect(page.getByRole('link', { name: 'Conhecer autor: Luana Góes' })).toBeVisible();
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

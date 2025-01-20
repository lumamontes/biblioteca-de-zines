import it from '@playwright/test';

it.describe('/zines/[id] Page', () => {
  const validZineUuid = '76dfa9a9-fa0a-4288-8bf5-5ee3637e8951';
  const invalidZineUuid = 'invalid-id';

  it('renders zine details for a valid uuid', async ({ page }) => {
    await page.goto(`/zines/${validZineUuid}`);
    await it.expect(page.locator('text=girlhood')).toBeVisible();
    await it.expect(page.locator('text=Luana Góes')).toBeVisible();
  });

  it('displays error message for an invalid uuid', async ({ page }) => {
    await page.goto(`/zines/${invalidZineUuid}`);
    await it.expect(page.locator('text=Ops! Parece que algo deu errado')).toBeVisible();
    await it.expect(page.locator('text=Voltar para a página inicial')).toBeVisible();

    await page.click('text=Voltar para a página inicial');
    await it.expect(page).toHaveURL('/');
    await it.expect(page.locator('text=Biblioteca de Zines')).toBeVisible();
  });
});

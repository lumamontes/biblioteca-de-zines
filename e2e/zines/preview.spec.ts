import { test, expect } from '@playwright/test';

test.describe('/zines/[id] Page', () => {
  const validZineUuid = 'a2b9e91d-0ba5-4f54-8eb9-3d359c636544';
  const invalidZineUuid = 'invalid-id';

  test('renders zine details for a valid uuid', async ({ page }) => {
    await page.goto(`/zines/${validZineUuid}`);
    await expect(page.locator('text=girlhood')).toBeVisible();
    await expect(page.locator('text=Luana Góes')).toBeVisible();
  });

  test('displays error message for an invalid uuid', async ({ page }) => {
    await page.goto(`/zines/${invalidZineUuid}`);
    await expect(page.locator('text=Ops! Parece que algo deu errado')).toBeVisible();
    await expect(page.locator('text=Voltar para a página inicial')).toBeVisible();

    await page.click('text=Voltar para a página inicial');
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Biblioteca de Zines')).toBeVisible();
  });
});

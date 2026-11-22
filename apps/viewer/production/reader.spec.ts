import { parsePublicReaderResponse } from '@biblioteca-de-zines/reader';
import { expect, test } from '@playwright/test';

const sample = [
  'coletivo-ventos-do-norte-visagens-no-meio-do-mundo',
  'aimee-morais-entre-os-cacos',
];
const viewerOrigin = 'https://viewer.biblioteca-de-zines.com.br';

for (const slug of sample) {
  for (const surface of ['direto', 'embed'] as const) {
    test(`leitor de produção (tráfego sintético): ${surface} / ${slug}`, async ({ page }) => {
      // Keep synthetic events out of the production reader counters.
      await page.route('**/api/public-reader/events', (route) => route.abort());
      const manifestResponse = page.waitForResponse((response) => {
        const url = new URL(response.url());
        return url.pathname === `/api/public-reader/v1/${slug}` &&
          url.searchParams.get('surface') === (surface === 'direto' ? 'standalone' : 'embed');
      });
      void manifestResponse.catch(() => {}); // Navigation can fail before the manifest check.
      await test.step('abrir pelo catálogo', async () => {
        const response = await page.goto(`/zines/${slug}?view=reader`);
        expect(response?.status(), 'HTTP da ficha').toBe(200);
        if (surface === 'direto') {
          const link = page.getByRole('link', { name: 'Abrir leitor em nova aba' });
          const href = await link.getAttribute('href');
          expect(href === `${viewerOrigin}/p/${slug}`, 'link do leitor direto').toBe(true);
          await page.goto(`${viewerOrigin}/p/${slug}`);
        }
      });

      const reader = surface === 'direto'
        ? page
        : page.frameLocator('iframe[title^="Leitura digital de "]');
      const manifest = await test.step('carregar manifesto público', async () => {
        const response = await manifestResponse;
        expect(response.status(), 'HTTP do manifesto').toBe(200);
        const result = parsePublicReaderResponse(await response.json());
        if (result.status !== 'ready') throw new Error('Manifesto público indisponível');
        expect(result.manifest.pages.length, 'páginas no manifesto').toBeGreaterThanOrEqual(2);
        return result.manifest;
      });

      const next = reader.getByRole('button', { name: 'Flip right', exact: true });
      await test.step('inicializar BookReader', async () => {
        await expect(next).toBeVisible({ timeout: 12_000 });
      });

      const currentPage = reader.locator('.BRcurrentpage');
      const images = reader.locator('.BRpage-visible img.BRpageimage:visible');
      for (const pageNumber of [1, 2]) {
        await test.step(`exibir imagem da página ${pageNumber}`, async () => {
          if (pageNumber === 2) await next.click();
          await expect(currentPage).toHaveText(new RegExp(`^${pageNumber} of `));
          const imageUrl = manifest.pages.find((entry) => entry.pageNumber === pageNumber)?.imageUrl;
          expect(typeof imageUrl === 'string', 'imagem declarada no manifesto').toBe(true);
          await expect.poll(() => images.evaluateAll((elements, url) =>
            elements.some((element) => {
              const img = element as HTMLImageElement;
              return img.src === url && img.complete && img.naturalWidth > 0;
            }), imageUrl), { message: 'imagem carregada dentro da área do leitor', timeout: 12_000 }).toBe(true);
        });
      }
    });
  }
}

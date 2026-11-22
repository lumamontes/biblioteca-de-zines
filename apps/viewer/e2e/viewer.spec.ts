import { expect, test } from '@playwright/test';

const readyResponse = {
  fallback: { label: 'Abrir o PDF original', url: 'https://assets.example/zine.pdf' },
  manifest: {
    generationId: 'generation-1',
    pageCount: 1,
    pages: [{ generationId: 'generation-1', pageNumber: 1, imageUrl: 'https://assets.example/page-1.webp', width: 100, height: 150 }],
  },
  publication: { id: 42, slug: 'zine', title: 'Test zine' },
  status: 'ready',
};

test.beforeEach(async ({ page }) => {
  await page.route('**/jquery@3.7.1/dist/jquery.min.js', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: 'window.jQuery = window.$ = function() {};',
  }));
  await page.route('**/api/public-reader/events', (route) => route.fulfill({ status: 204 }));
  await page.route('**/api/public-reader/**', (route) => route.fulfill({
    contentType: 'application/json',
    status: 200,
    body: JSON.stringify(readyResponse),
  }));
});

test('initializes from the public manifest and loads BookReader only in the viewer', async ({ page }) => {
  const bookReaderRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('@internetarchive/bookreader') || request.url().includes('/jquery@3.7.1/')) bookReaderRequests.push(request.url());
  });
  await mockBookReaderAssets(page);
  await page.goto('/p/zine');

  await expect(page.locator('.reader__canvas')).toBeVisible();
  await expect.poll(() => bookReaderRequests).toEqual(expect.arrayContaining([
    expect.stringContaining('/jquery@3.7.1/dist/jquery.min.js'),
    expect.stringContaining('/BookReader/BookReader.js'),
    expect.stringContaining('/BookReader/BookReader.css'),
  ]));
  expect(await page.locator('body').textContent()).not.toContain('Supabase');
});

test('translates navigation through the isolated BookReader adapter', async ({ page }) => {
  await mockBookReaderAssets(page);
  await page.goto('/p/zine');
  await expect(page.locator('.reader__canvas')).toBeVisible();

  await page.evaluate(() => window.__bibliotecaBookReaderInstances[0]?.next());
  await expect.poll(() => page.evaluate(() => window.__bibliotecaBookReaderEvents)).toContain('next');
});

test('forwards viewport resize events to BookReader', async ({ page }) => {
  await mockBookReaderAssets(page);
  await page.goto('/p/zine');
  await expect(page.locator('.reader__canvas')).toBeVisible();

  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await expect.poll(() => page.evaluate(() => window.__bibliotecaBookReaderEvents)).toContain('resize');
});

test('preserves the PDF fallback when BookReader initialization fails', async ({ page }) => {
  const events: string[] = [];
  await page.route('**/api/public-reader/events', (route) => {
    events.push(route.request().postDataJSON().type);
    return route.fulfill({ status: 204 });
  });
  await page.route('**/@internetarchive/bookreader@5.0.0-87/BookReader/BookReader.js', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: 'window.BookReader = function() { this.bind = function() {}; this.init = function() { throw new Error("init failed"); }; };',
  }));
  await page.route('**/@internetarchive/bookreader@5.0.0-87/BookReader/BookReader.css', (route) => route.fulfill({ contentType: 'text/css', body: '' }));

  await page.goto('/p/zine');

  await expect(page.getByText('A leitura em páginas não pôde ser carregada.', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Abrir o PDF original/ })).toHaveAttribute('href', readyResponse.fallback.url);
  await expect.poll(() => [...events].sort()).toEqual(['fallback', 'page-error']);
});

test('attributes an old reader link to the canonical publication', async ({ page }) => {
  await mockBookReaderAssets(page);
  const ready = page.waitForRequest(request => request.url().endsWith('/events')
    && request.method() === 'POST' && request.postDataJSON().type === 'ready');
  await page.goto('/p/old-zine');
  expect((await ready).postDataJSON()).toMatchObject({ slug: 'zine', surface: 'standalone' });
});

for (const { reason, url, types } of [
  { reason: 'page-generation-failed', url: readyResponse.fallback.url, types: ['fallback', 'page-error'] },
  { reason: 'source-unavailable', url: '', types: ['page-error'] },
  { reason: 'page-generation-unavailable', url: readyResponse.fallback.url, types: ['fallback'] },
]) {
  test(`reports the expected events for ${reason}`, async ({ page }) => {
    const events: Array<{ slug: string; type: string }> = [];
    await page.route('**/api/public-reader/events', route => {
      events.push(route.request().postDataJSON());
      return route.fulfill({ status: 204 });
    });
    await page.route('**/api/public-reader/v1/**', route => route.fulfill({ json: {
      fallback: { ...readyResponse.fallback, url },
      publication: readyResponse.publication,
      reason,
      status: 'fallback',
    } }));
    await page.goto('/embed/p/old-zine');
    await expect(page.getByText('A leitura em páginas não pôde ser carregada.', { exact: true })).toBeVisible();
    await expect.poll(() => events.map(event => event.type).sort()).toEqual(types);
    expect(events.every(event => event.slug === 'zine')).toBe(true);
  });
}

test('serves the unbranded embed and optional Biblioteca branding', async ({ page }) => {
  await mockBookReaderAssets(page);
  await page.goto('/embed/p/zine');
  await expect(page.getByRole('img', { name: 'Biblioteca de Zines' })).toHaveCount(0);

  await page.goto('/embed/p/zine?branding=biblioteca');
  await expect(page.getByRole('img', { name: 'Biblioteca de Zines' })).toHaveCount(1);
});

test('shows the PDF fallback when the endpoint is unavailable', async ({ page }) => {
  await page.unroute('**/api/public-reader/**');
  await page.route('**/api/public-reader/**', (route) => route.fulfill({
    contentType: 'application/json',
    status: 404,
    body: JSON.stringify({ error: 'Reader unavailable' }),
  }));
  await page.goto('/p/zine');

  await expect(page.getByText('A leitura em páginas não pôde ser carregada.', { exact: true })).toBeVisible();
  await expect(page.getByText('O PDF original não está disponível.')).toBeVisible();
});

async function mockBookReaderAssets(page: import('@playwright/test').Page) {
  await page.route('**/@internetarchive/bookreader@5.0.0-87/BookReader/BookReader.js', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: `window.__bibliotecaBookReaderEvents = [];
      window.__bibliotecaBookReaderInstances = [];
      window.BookReader = function() {
        this.bind = function(name, callback) { this.pageChanged = callback; };
        this.unbind = function() {};
        this.init = function() {};
        this.destroy = function() {};
        this.next = function() { window.__bibliotecaBookReaderEvents.push('next'); this.pageChanged?.(2); };
        this.prev = function() {};
        this.jumpToPage = function() {};
        this.resize = function() { window.__bibliotecaBookReaderEvents.push('resize'); };
        window.__bibliotecaBookReaderInstances.push(this);
      };`,
  }));
  await page.route('**/@internetarchive/bookreader@5.0.0-87/BookReader/BookReader.css', (route) => route.fulfill({ contentType: 'text/css', body: '' }));
}

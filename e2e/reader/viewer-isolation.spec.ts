import { expect, test, type Page } from '@playwright/test';

const readerApi = {
  fallback: { label: 'Abrir o PDF original', url: 'https://assets.example/zine.pdf' },
  manifest: {
    generationId: 'generation-1',
    pageCount: 1,
    pages: [{ generationId: 'generation-1', pageNumber: 1, imageUrl: 'https://assets.example/page-1.webp', width: 100, height: 150 }],
  },
  publication: { id: 42, slug: 'zine', title: 'Test zine' },
  status: 'ready',
};

test('initializes the viewer from a complete public manifest without touching Supabase', async ({ page }) => {
  const bookReaderRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('@internetarchive/bookreader')) bookReaderRequests.push(request.url());
  });
  await mockReaderApi(page, readerApi);
  await mockBookReaderAssets(page);

  await page.goto('/viewer/v1/zine');

  await expect(page.locator('[data-reader-generation="generation-1"]')).toBeVisible();
  expect(bookReaderRequests).toEqual(expect.arrayContaining([
    expect.stringContaining('/BookReader/BookReader.js'),
    expect.stringContaining('/BookReader/BookReader.css'),
  ]));
  expect(await page.locator('body').textContent()).not.toContain('Supabase');
});

test('translates BookReader navigation in the isolated viewer', async ({ page }) => {
  await mockReaderApi(page, readerApi);
  await mockBookReaderAssets(page);

  await page.goto('/viewer/v1/zine');
  await expect(page.locator('[data-reader-page="1"]')).toBeVisible();
  await page.evaluate(() => window.__bibliotecaBookReaderInstances[0].next());
  await expect.poll(() => page.evaluate(() => window.__bibliotecaBookReaderEvents)).toContain('next');
});

test('shows the fallback when BookReader initialization fails', async ({ page }) => {
  await mockReaderApi(page, readerApi);
  await page.route('**/@internetarchive/bookreader@5.0.0-87/BookReader/BookReader.js', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: 'window.BookReader = function() { this.init = function() { throw new Error("init failed"); }; };',
  }));
  await page.route('**/@internetarchive/bookreader@5.0.0-87/BookReader/BookReader.css', (route) => route.fulfill({
    contentType: 'text/css',
    body: '',
  }));

  await page.goto('/viewer/v1/zine');

  await expect(page.locator('main p[role="alert"]')).toContainText('não pôde ser carregada');
  await expect(page.getByRole('link', { name: /Abrir o PDF original/ })).toHaveAttribute('href', readerApi.fallback.url);
});

test('keeps the PDF fallback visible when the public reader endpoint is unavailable', async ({ page }) => {
  const bookReaderRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('@internetarchive/bookreader')) bookReaderRequests.push(request.url());
  });
  await page.route('**/api/public-reader/**', (route) => route.fulfill({
    contentType: 'application/json',
    status: 404,
    body: JSON.stringify({ error: 'Reader unavailable' }),
  }));

  await page.goto('/viewer/v1/zine');

  await expect(page.locator('main p[role="alert"]')).toContainText('não pôde ser carregada');
  await expect(page.locator('main')).toContainText('O PDF original não está disponível.');
  await expect(page.getByRole('link')).toHaveCount(0);
  expect(bookReaderRequests).toEqual([]);
});

test('does not load BookReader resources on the main application route', async ({ page }) => {
  const bookReaderRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('@internetarchive/bookreader')) bookReaderRequests.push(request.url());
  });

  await page.goto('/');

  expect(bookReaderRequests).toEqual([]);
});

async function mockReaderApi(page: Page, body: object) {
  await page.route('**/api/public-reader/**', (route) => route.fulfill({
    contentType: 'application/json',
    status: 200,
    body: JSON.stringify(body),
  }));
  await page.route('**/api/public-reader/events', (route) => route.fulfill({ status: 204 }));
}

async function mockBookReaderAssets(page: Page) {
  await page.route('**/@internetarchive/bookreader@5.0.0-87/BookReader/BookReader.js', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: `window.__bibliotecaBookReaderEvents = [];
    window.__bibliotecaBookReaderInstances = [];
    window.BookReader = function(options) {
      this.options = options;
      this.bind = function(name, callback) { this.pageChanged = callback; };
      this.unbind = function() { window.__bibliotecaBookReaderEvents.push('unbind'); };
      this.init = function() {};
      this.destroy = function() {
        window.__bibliotecaBookReaderEvents.push('destroy');
      };
      this.next = function() {
        window.__bibliotecaBookReaderEvents.push('next');
        this.pageChanged({}, { currentIndex: function() { return 1; } });
      };
      this.prev = function() {};
      this.jumpToPage = function() {};
      this.currentIndex = function() { return 0; };
      this.resize = function() {};
      window.__bibliotecaBookReaderInstances.push(this);
    };`,
  }));
  await page.route('**/@internetarchive/bookreader@5.0.0-87/BookReader/BookReader.css', (route) => route.fulfill({
    contentType: 'text/css',
    body: '.BookReaderContainer { min-height: 100px; }',
  }));
}

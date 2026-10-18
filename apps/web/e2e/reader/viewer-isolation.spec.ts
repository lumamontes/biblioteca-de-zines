import { expect, test } from '@playwright/test';

test('does not load BookReader resources on the main application route', async ({ page }) => {
  const bookReaderRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('@internetarchive/bookreader')) bookReaderRequests.push(request.url());
  });

  await page.goto('/');

  expect(bookReaderRequests).toEqual([]);
});

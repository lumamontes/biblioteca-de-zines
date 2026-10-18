import { createServer } from 'node:http';
import { after, test } from 'node:test';
import assert from 'node:assert/strict';

import { fetchMonitorResources } from './export-monitor-resources.mjs';

const servers = [];

after(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise((resolve) => {
          server.close(resolve);
        }),
    ),
  );
});

test('exports published PDF URLs with stable table-prefixed IDs', async () => {
  const server = createServer((request, response) => {
    response.setHeader('content-type', 'application/json');
    response.end(
      request.url.includes('library_zines')
        ? JSON.stringify([
            { id: 4, title: 'A Zine', pdf_url: 'https://drive.google.com/file/d/a/view' },
            { id: 5, title: null, pdf_url: null },
          ])
          : JSON.stringify([]),
    );
  });
  servers.push(server);
  await new Promise((resolve) => server.listen(0, resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

    await assert.doesNotReject(async () => {
      const resources = await fetchMonitorResources({ baseUrl, apiKey: 'test-key' });
    assert.deepEqual(resources, [
      {
        id: 'library_zines:4',
        url: 'https://drive.google.com/file/d/a/view',
        title: 'A Zine',
      },
    ]);
  });
});

test('fails clearly when Supabase rejects a table request', async () => {
  const fetchImpl = async () => new Response('denied', { status: 401 });

  await assert.rejects(
    fetchMonitorResources({
      baseUrl: 'https://supabase.example.test',
      apiKey: 'test-key',
      fetchImpl,
      tableNames: ['library_zines'],
    }),
    /Supabase library_zines request failed: HTTP 401/,
  );
});

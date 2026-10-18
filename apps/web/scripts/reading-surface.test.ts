import assert from 'node:assert/strict';
import test from 'node:test';
import { createZineReadingSurface } from '@/application/reader/reading-surface';

const readyReader = {
  status: 'available' as const,
  reader: {
    status: 'ready' as const,
    fallback: { label: 'Abrir PDF', url: 'https://assets.example/zine.pdf' },
    publication: { id: 1, slug: 'canonical-zine', title: 'Canonical zine' },
    manifest: {
      generationId: 'generation-1',
      pageCount: 2,
      pages: [
        { generationId: 'generation-1', pageNumber: 1, imageUrl: 'https://assets.example/1.webp', width: 100, height: 150 },
        { generationId: 'generation-1', pageNumber: 2, imageUrl: 'https://assets.example/2.webp', width: 100, height: 150 },
      ],
    },
  },
};

test('creates a beta reading surface from an available canonical reader', () => {
  assert.deepEqual(createZineReadingSurface({
    pdfUrl: 'https://assets.example/zine.pdf',
    title: 'Zine',
    viewerOrigin: 'http://localhost:4100',
    reader: readyReader,
  }), {
    pdfDownloadUrl: 'https://assets.example/zine.pdf',
    pdfUrl: 'https://assets.example/zine.pdf',
    title: 'Zine',
    beta: {
      embedUrl: 'http://localhost:4100/embed/p/canonical-zine',
      viewerUrl: 'http://localhost:4100/p/canonical-zine',
      pageCount: 2,
    },
  });
});

test('does not expose beta or embed configuration when the reader is unavailable', () => {
  assert.equal(createZineReadingSurface({
    pdfUrl: 'https://assets.example/zine.pdf',
    title: 'Zine',
    reader: { status: 'unavailable' },
  }).beta, null);
});

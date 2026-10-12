import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createPageManifest,
  InvalidPageManifestError,
} from '../../domain/reader/page-manifest';
import {
  createReaderSession,
  type ReaderRenderer,
} from './reader-session';

const page = (pageNumber: number, generationId = 'generation-1') => ({
  generationId,
  pageNumber,
  imageUrl: `/pages/${pageNumber}.webp`,
  width: 1200,
  height: 1600,
});

test('accepts a complete ordered page manifest from one generation', () => {
  const manifest = createPageManifest({
    generationId: 'generation-1',
    pageCount: 2,
    pages: [page(1), page(2)],
  });

  assert.deepEqual(manifest, {
    generationId: 'generation-1',
    pageCount: 2,
    pages: [page(1), page(2)],
  });
});

test('rejects an empty page manifest', () => {
  assert.throws(
    () => createPageManifest({ generationId: 'generation-1', pageCount: 0, pages: [] }),
    (error: unknown) => error instanceof InvalidPageManifestError && error.issues.includes('empty'),
  );
});

test('rejects duplicate, skipped, mixed-generation, and dimensionless pages', () => {
  assert.throws(
    () => createPageManifest({
      generationId: 'generation-1',
      pageCount: 3,
      pages: [
        page(1),
        { ...page(1, 'generation-2'), width: 0 },
        page(3),
      ],
    }),
    (error: unknown) => error instanceof InvalidPageManifestError && ([
      'duplicate-page-number',
      'page-sequence',
      'mixed-generation',
      'invalid-dimensions',
    ] as const).every((issue) => error.issues.includes(issue)),
  );
});

test('delegates mounted reader operations and publishes page changes through a fake adapter', () => {
  const manifest = createPageManifest({ generationId: 'generation-1', pageCount: 2, pages: [page(1), page(2)] });
  const calls: string[] = [];
  let onPageChanged = (_pageNumber: number) => { void _pageNumber; };
  const renderer: ReaderRenderer = {
    mount: (_target, _manifest, callback) => {
      void _target;
      void _manifest;
      calls.push('mount');
      onPageChanged = callback;
    },
    next: () => calls.push('next'),
    previous: () => calls.push('previous'),
    goTo: (pageNumber) => calls.push(`go-to:${pageNumber}`),
    destroy: () => calls.push('destroy'),
  };
  const session = createReaderSession({ manifest, fallback: { url: '/publication.pdf', label: 'Open PDF' } }, renderer);
  const states: string[] = [];
  session.subscribe((state) => states.push(state.status === 'ready' ? `page:${state.currentPage}` : state.status));

  session.mount({});
  onPageChanged(2);
  session.next();
  session.previous();
  session.goTo(1);
  session.destroy();

  assert.deepEqual(calls, ['mount', 'next', 'previous', 'go-to:1', 'destroy']);
  assert.deepEqual(states, ['page:2']);
  assert.equal(session.getState().status, 'ready');
});

test('uses the explicit PDF fallback without mounting a renderer when no manifest exists', () => {
  const calls: string[] = [];
  const renderer: ReaderRenderer = {
    mount: () => calls.push('mount'),
    next: () => calls.push('next'),
    previous: () => calls.push('previous'),
    goTo: () => calls.push('go-to'),
    destroy: () => calls.push('destroy'),
  };
  const session = createReaderSession({ fallback: { url: '/publication.pdf', label: 'Open PDF' } }, renderer);

  session.mount({});
  session.next();
  session.useFallback();

  assert.deepEqual(calls, []);
  assert.deepEqual(session.getState(), {
    status: 'fallback',
    fallback: { url: '/publication.pdf', label: 'Open PDF' },
    reason: 'page-generation-unavailable',
  });
});

test('destroys a mounted renderer when the session switches to the PDF fallback', () => {
  const manifest = createPageManifest({ generationId: 'generation-1', pageCount: 1, pages: [page(1)] });
  const calls: string[] = [];
  const renderer: ReaderRenderer = {
    mount: () => calls.push('mount'),
    next: () => calls.push('next'),
    previous: () => calls.push('previous'),
    goTo: () => calls.push('go-to'),
    destroy: () => calls.push('destroy'),
  };
  const session = createReaderSession({ manifest, fallback: { url: '/publication.pdf', label: 'Open PDF' } }, renderer);

  session.mount({});
  session.useFallback('reader-failure');
  session.useFallback('user-selected');

  assert.deepEqual(calls, ['mount', 'destroy']);
  assert.equal(session.getState().status, 'fallback');
});

test('falls back instead of mounting an incomplete generation at the session boundary', () => {
  const calls: string[] = [];
  const renderer: ReaderRenderer = {
    mount: () => calls.push('mount'),
    next: () => calls.push('next'),
    previous: () => calls.push('previous'),
    goTo: () => calls.push('go-to'),
    destroy: () => calls.push('destroy'),
  };
  const session = createReaderSession({
    manifest: { generationId: 'generation-1', pageCount: 2, pages: [page(1)] },
    fallback: { url: '/publication.pdf', label: 'Open PDF' },
  }, renderer);

  session.mount({});

  assert.deepEqual(calls, []);
  const state = session.getState();
  assert.equal(state.status, 'fallback');
  assert.equal(state.reason, 'page-generation-unavailable');
});

test('switches to the PDF fallback when renderer initialization fails', () => {
  const calls: string[] = [];
  const renderer: ReaderRenderer = {
    mount: () => {
      calls.push('mount');
      throw new Error('renderer failed');
    },
    next: () => calls.push('next'),
    previous: () => calls.push('previous'),
    goTo: () => calls.push('go-to'),
    destroy: () => calls.push('destroy'),
  };
  const manifest = createPageManifest({ generationId: 'generation-1', pageCount: 1, pages: [page(1)] });
  const session = createReaderSession({ manifest, fallback: { url: '/publication.pdf', label: 'Open PDF' } }, renderer);

  session.mount({});

  assert.deepEqual(calls, ['mount', 'destroy']);
  assert.deepEqual(session.getState(), {
    status: 'fallback',
    fallback: { url: '/publication.pdf', label: 'Open PDF' },
    reason: 'reader-failure',
  });
});

test('keeps the PDF fallback available when renderer cleanup fails', () => {
  const renderer: ReaderRenderer = {
    mount: () => {},
    next: () => {},
    previous: () => {},
    goTo: () => {},
    destroy: () => {
      throw new Error('cleanup failed');
    },
  };
  const manifest = createPageManifest({ generationId: 'generation-1', pageCount: 1, pages: [page(1)] });
  const session = createReaderSession({ manifest, fallback: { url: '/publication.pdf', label: 'Open PDF' } }, renderer);

  session.mount({});
  session.useFallback('reader-failure');

  assert.equal(session.getState().status, 'fallback');
});

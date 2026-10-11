import { describe, expect, it, vi } from 'vitest';
import type { ReaderInput, ReaderPage } from './contract';
import { createPdfLoader } from './pdf';
import { createReader, imagePagesLoader } from './reader';

const input: ReaderInput = {
  publication: {
    kind: 'image-pages',
    pages: [{ url: '/page-1.svg' }, { url: '/page-2.svg' }],
  },
  configuration: { provider: 'ordered-images', mode: 'slide' },
  metadata: { title: 'A fixture publication', creator: 'A zineiro' },
  fallback: { url: 'https://example.com/publication.pdf', label: 'Open PDF viewer' },
};

describe('framework-independent reader boundary', () => {
  it('reports loading then ready for an explicit provider', async () => {
    const reader = createReader(input, { 'ordered-images': imagePagesLoader });
    const statuses: string[] = [];
    reader.subscribe((state) => statuses.push(state.status));

    await reader.load();

    expect(statuses).toEqual(['loading', 'ready']);
    expect(reader.getState()).toMatchObject({
      status: 'ready',
      pageCount: 2,
      currentPage: 0,
      loadedPages: [0, 1],
      representation: 'reading-derivative',
    });
  });

  it('does not silently switch providers when the configured one is unavailable', async () => {
    const reader = createReader(input, { 'direct-pdf': vi.fn() });

    await reader.load();

    expect(reader.getState()).toMatchObject({ status: 'failure', message: expect.stringContaining('ordered-images') });
  });

  it('rejects a representation that does not match the configured provider', async () => {
    const loader = vi.fn(imagePagesLoader);
    const reader = createReader({ ...input, configuration: { provider: 'direct-pdf', mode: 'slide' } }, {
      'direct-pdf': loader,
    });

    await reader.load();

    expect(loader).not.toHaveBeenCalled();
    expect(reader.getState()).toMatchObject({ status: 'failure', message: expect.stringContaining('cannot load image-pages') });
  });

  it('exposes navigation and mode changes without renderer APIs', async () => {
    const reader = createReader(input, { 'ordered-images': imagePagesLoader });
    await reader.load();

    reader.next();
    reader.setMode('page-turn');

    await vi.waitFor(() => expect(reader.getState()).toMatchObject({ status: 'ready', currentPage: 1, mode: 'page-turn' }));
    reader.next();
    expect(reader.getState()).toMatchObject({ currentPage: 1 });
  });

  it('reports source failures and lets the host select the standard viewer', async () => {
    const reader = createReader(input, {
      'ordered-images': async () => {
        throw new Error('Source is not browser-readable.');
      },
    });

    await reader.load();
    expect(reader.getState()).toMatchObject({ status: 'failure', fallback: input.fallback });

    reader.useFallback();
    expect(reader.getState()).toMatchObject({ status: 'fallback', reason: 'Source is not browser-readable.' });
  });

  it('publishes the visible page before warming an adjacent page', async () => {
    const loadPage = vi.fn(async (index: number) => ({ url: `/page-${index + 1}.svg`, index }));
    const reader = createReader(input, {
      'ordered-images': async () => ({ pageCount: 3, loadPage }),
    });
    const states: string[] = [];
    reader.subscribe((state) => states.push(`${state.status}:${state.status === 'ready' ? state.pages.length : ''}`));

    await reader.load();
    expect(states.slice(0, 2)).toEqual(['loading:', 'ready:1']);
    await vi.waitFor(() => expect(loadPage).toHaveBeenCalledWith(1));
    const state = reader.getState();
    expect(state).toMatchObject({ status: 'ready', pageCount: 3, currentPage: 0 });
    if (state.status === 'ready') expect(state.pages).toHaveLength(2);
  });

  it('reports a page rendering failure separately from a source failure', async () => {
    const reader = createReader(input, {
      'ordered-images': async () => ({
        pageCount: 2,
        loadPage: async (index: number) => {
          if (index === 1) throw new Error('Page render failed.');
          return { url: '/page-1.svg', index };
        },
      }),
    });

    await reader.load();
    reader.next();
    await vi.waitFor(() => expect(reader.getState()).toMatchObject({ status: 'page-failure', page: 1, currentPage: 0 }));
    reader.useFallback();
    expect(reader.getState()).toMatchObject({ status: 'fallback', reason: 'Page render failed.' });
  });

  it('adapts PDF.js documents lazily and preserves one-based PDF page requests', async () => {
    const getPage = vi.fn(async (page: number) => ({
      getViewport: () => ({ width: 1, height: 1 }),
      render: () => ({ promise: Promise.resolve() }),
    }));
    const loadPdfPage = createPdfLoader({
      getDocument: vi.fn(() => ({ promise: Promise.resolve({ numPages: 4, getPage }) })),
    }, { renderPage: async (_page, index) => ({ url: `/pdf-${index + 1}.png`, index }) });
    const document = await loadPdfPage({ kind: 'pdf', url: 'https://cdn.example/zine.pdf' });

    expect(document.pageCount).toBe(4);
    expect(getPage).not.toHaveBeenCalled();
    await document.loadPage(2);
    expect(getPage).toHaveBeenCalledWith(3);
  });

  it('stops publishing after destroy', async () => {
    const listener = vi.fn();
    const reader = createReader(input, { 'ordered-images': imagePagesLoader });
    reader.subscribe(listener);
    reader.destroy();

    await reader.load();
    expect(listener).not.toHaveBeenCalled();
  });

  it('preserves image order and keeps covers out of interior spreads', async () => {
    const orderedInput = {
      ...input,
      publication: {
        kind: 'image-pages' as const,
        pages: [{ url: 'cover' }, { url: 'one' }, { url: 'two' }, { url: 'back' }],
      },
    };
    const reader = createReader(orderedInput, { 'ordered-images': imagePagesLoader });

    await reader.load();

    expect(reader.getState()).toMatchObject({
      status: 'ready',
      pages: [{ index: 0, url: 'cover' }, { index: 1, url: 'one' }, { index: 2, url: 'two' }, { index: 3, url: 'back' }],
    });
    expect(reader.getVisiblePages(true).map((page) => page.index)).toEqual([0]);
    reader.goTo(1);
    expect(reader.getVisiblePages(true).map((page) => page.index)).toEqual([1, 2]);
    reader.goTo(3);
    expect(reader.getVisiblePages(true).map((page) => page.index)).toEqual([3]);
    reader.goTo(2);
    expect(reader.getVisiblePages(true).map((page) => page.index)).toEqual([1, 2]);
  });

  it('loads the visible page and adjacent pages, then releases distant surfaces', async () => {
    const surface = {
      load: vi.fn(async (_page: ReaderPage) => undefined),
      release: vi.fn(),
    };
    const reader = createReader({
      ...input,
      publication: { kind: 'image-pages', pages: Array.from({ length: 5 }, (_, index) => ({ url: `page-${index}` })) },
    }, { 'ordered-images': imagePagesLoader, pageSurface: surface });

    await reader.load();
    expect(surface.load.mock.calls.map(([page]) => page.index)).toEqual([0, 1]);
    expect(reader.getState()).toMatchObject({ status: 'ready', loadedPages: [0, 1] });

    reader.goTo(3);
    await vi.waitFor(() => expect(reader.getState()).toMatchObject({ status: 'ready', loadedPages: [2, 3, 4] }));
    expect(surface.release.mock.calls.map(([page]) => page.index)).toEqual([0, 1]);
  });

  it('fails consistently when a page surface cannot load and retains the fallback', async () => {
    const reader = createReader(input, {
      'ordered-images': imagePagesLoader,
      pageSurface: { load: async () => { throw new Error('Image is not browser-readable.'); }, release: vi.fn() },
    });

    await reader.load();

    expect(reader.getState()).toMatchObject({ status: 'failure', message: 'Image is not browser-readable.', fallback: input.fallback });
  });

  it('releases retained surfaces when the reader is destroyed', async () => {
    const surface = { load: vi.fn(async (_page: ReaderPage) => undefined), release: vi.fn() };
    const reader = createReader(input, { 'ordered-images': imagePagesLoader, pageSurface: surface });

    await reader.load();
    reader.destroy();

    expect(surface.release.mock.calls.map(([page]) => page.index)).toEqual([0, 1]);
  });
});

import { describe, expect, it, vi } from 'vitest';
import type { ReaderInput } from './contract';
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
    expect(reader.getState()).toMatchObject({ status: 'ready', pageCount: 2, currentPage: 0 });
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

    expect(reader.getState()).toMatchObject({ status: 'ready', currentPage: 1, mode: 'page-turn' });
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

  it('stops publishing after destroy', async () => {
    const listener = vi.fn();
    const reader = createReader(input, { 'ordered-images': imagePagesLoader });
    reader.subscribe(listener);
    reader.destroy();

    await reader.load();
    expect(listener).not.toHaveBeenCalled();
  });
});

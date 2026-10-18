import assert from 'node:assert/strict';
import test from 'node:test';
import { createReaderSession } from '@/application/reader-session';
import type { ReaderRenderer } from '@/application/reader-types';
import type { ReaderPageManifest } from '@biblioteca-de-zines/reader-contracts';

const manifest: ReaderPageManifest = {
  generationId: 'generation-1',
  pageCount: 2,
  pages: [
    { generationId: 'generation-1', pageNumber: 1, imageUrl: 'https://assets.example/1.webp', width: 100, height: 150 },
    { generationId: 'generation-1', pageNumber: 2, imageUrl: 'https://assets.example/2.webp', width: 100, height: 150 },
  ],
};

test('keeps reader operations provider-neutral and falls back on renderer failure', () => {
  const calls: string[] = [];
  let onPageChanged = (_page: number) => {};
  let onError = () => {};
  const renderer: ReaderRenderer = {
    mount: (_target, _manifest, pageChanged, error) => { calls.push('mount'); onPageChanged = pageChanged; onError = error ?? (() => {}); },
    next: () => calls.push('next'),
    previous: () => calls.push('previous'),
    goTo: (page) => calls.push(`go-to:${page}`),
    destroy: () => calls.push('destroy'),
  };
  const session = createReaderSession({ manifest, fallback: { label: 'Open PDF', url: '/zine.pdf' } }, renderer);
  const states: string[] = [];
  session.subscribe((state) => states.push(state.status === 'ready' ? `page:${state.currentPage}` : state.reason));
  session.mount({} as HTMLElement);
  onPageChanged(2);
  session.next();
  session.previous();
  session.goTo(1);
  onError();
  session.destroy();

  assert.deepEqual(calls, ['mount', 'next', 'previous', 'go-to:1', 'destroy']);
  assert.deepEqual(states, ['page:2', 'reader-failure']);
});

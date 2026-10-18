import assert from 'node:assert/strict';
import test from 'node:test';
import { createReaderSession } from '@/application/reader-session';
import type { ReaderRenderer } from '@/application/reader-types';
import type { ReaderPageManifest } from '@biblioteca-de-zines/reader';

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

test('keeps the requested page in session state and clamps it to the manifest', () => {
  const renderer: ReaderRenderer = {
    mount() {},
    next() {},
    previous() {},
    goTo() {},
    destroy() {},
  };

  const session = createReaderSession({ initialPage: 99, manifest, fallback: { label: 'Open PDF', url: '/zine.pdf' } }, renderer);

  assert.equal(session.getState().status, 'ready');
  assert.equal(session.getState().currentPage, 2);
});

test('cleans up when the renderer fails during mount', () => {
  let destroyed = 0;
  const renderer: ReaderRenderer = {
    mount() { throw new Error('mount failed'); },
    next() {},
    previous() {},
    goTo() {},
    destroy() { destroyed += 1; },
  };

  const session = createReaderSession({ manifest, fallback: { label: 'Open PDF', url: '/zine.pdf' } }, renderer);

  assert.throws(() => session.mount({} as HTMLElement), /mount failed/);
  assert.equal(destroyed, 1);
});

test('cleans up when the renderer reports an error during mount', () => {
  let destroyed = 0;
  const renderer: ReaderRenderer = {
    mount: (_target, _manifest, _pageChanged, onError) => onError?.(),
    next() {},
    previous() {},
    goTo() {},
    destroy() { destroyed += 1; },
  };

  const session = createReaderSession({ manifest, fallback: { label: 'Open PDF', url: '/zine.pdf' } }, renderer);
  session.mount({} as HTMLElement);

  assert.equal(session.getState().status, 'fallback');
  assert.equal(destroyed, 1);
});

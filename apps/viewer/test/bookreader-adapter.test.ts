import assert from 'node:assert/strict';
import test from 'node:test';
import { createBookReaderRenderer, type BookReaderFactory, type BookReaderInstance } from '@/infrastructure/bookreader-adapter';
import type { ReaderPageManifest } from '@biblioteca-de-zines/reader';

const manifest: ReaderPageManifest = {
  generationId: 'generation-1',
  pageCount: 2,
  pages: [
    { generationId: 'generation-1', pageNumber: 1, imageUrl: 'https://assets/page-1.webp', width: 100, height: 150 },
    { generationId: 'generation-1', pageNumber: 2, imageUrl: 'https://assets/page-2.webp', width: 100, height: 150 },
  ],
};

test('translates the manifest, navigation, page changes, and cleanup', () => {
  const events: string[] = [];
  let pageChanged: ((page: number) => void) | undefined;
  let options: { data: Array<Array<{ uri: string; width: number; height: number }>>; defaults: string; enablePageResume: boolean; showLogo: boolean } | undefined;
  const instance: BookReaderInstance = {
    bind: (event, callback) => { events.push(`bind:${event}`); if (event === 'pageChanged') pageChanged = (page) => callback(page); },
    destroy: () => { events.push('destroy'); },
    init: () => { events.push('init'); },
    jumpToPage: (page) => { events.push(`jump:${page}`); },
    next: () => { events.push('next'); },
    prev: () => { events.push('prev'); },
    resize: () => { events.push('resize'); },
    unbind: (event) => { events.push(`unbind:${event}`); },
  };
  const Factory: BookReaderFactory = class { constructor(value) { options = value as typeof options; return instance; } };
  const renderer = createBookReaderRenderer(Factory);
  const target = createTarget();
  let changedPage = 0;

  renderer.mount(target, manifest, (page) => { changedPage = page; });
  renderer.next();
  renderer.previous();
  renderer.goTo(2);
  pageChanged?.(2);
  renderer.destroy();

  assert.equal(options?.data[0]?.[0]?.uri, 'https://assets/page-1.webp');
  assert.equal(options?.data[1]?.[0]?.width, 100);
  assert.equal(options?.defaults, 'page/n0/mode/2up');
  assert.equal(options?.enablePageResume, false);
  assert.equal(options?.showLogo, false);
  assert.equal(changedPage, 2);
  assert.deepEqual(events, ['bind:pageChanged', 'bind:error', 'init', 'next', 'prev', 'jump:2', 'unbind:pageChanged', 'unbind:error', 'destroy']);
  assert.equal(target.cleared, true);
});

test('passes an explicit starting mode and clamps the page to the manifest', () => {
  let options: { defaults: string } | undefined;
  const instance: BookReaderInstance = { bind() {}, init() {}, jumpToPage() {}, next() {}, prev() {} };
  const Factory: BookReaderFactory = class { constructor(value) { options = value as typeof options; return instance; } };
  const renderer = createBookReaderRenderer(Factory, { mode: '1up', page: 4 });

  renderer.mount(createTarget(), manifest, () => {});

  assert.equal(options?.defaults, 'page/n1/mode/1up');
});

test('reports initialization failures and cleans the failed instance', () => {
  const events: string[] = [];
  const Factory: BookReaderFactory = class {
    bind(event: string) { events.push(`bind:${event}`); }
    destroy() { events.push('destroy'); }
    init() { throw new Error('BookReader failed'); }
    jumpToPage() {}
    next() {}
    prev() {}
    unbind(event: string) { events.push(`unbind:${event}`); }
  };
  const renderer = createBookReaderRenderer(Factory);
  let failed = false;

  assert.throws(() => renderer.mount(createTarget(), manifest, () => {}, () => { failed = true; }), /BookReader failed/);

  assert.equal(failed, true);
  assert.deepEqual(events, ['bind:pageChanged', 'bind:error', 'unbind:pageChanged', 'unbind:error', 'destroy']);
});

function createTarget() {
  return { cleared: false, id: 'reader-target', replaceChildren() { this.cleared = true; } };
}

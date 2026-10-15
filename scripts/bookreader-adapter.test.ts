import assert from 'node:assert/strict';
import test from 'node:test';
import { createBookReaderRenderer } from '../src/infrastructure/reader/bookreader-adapter';
import type { BookReaderInstance, BookReaderOptions, BookReaderFactory } from '../src/infrastructure/reader/bookreader-adapter-types';
import type { ReaderPageManifest } from '../src/domain/reader/page-manifest-types';

const manifest: ReaderPageManifest = {
  generationId: 'generation-1',
  pageCount: 2,
  pages: [
    { generationId: 'generation-1', pageNumber: 1, imageUrl: 'https://assets/page-1.webp', width: 100, height: 150 },
    { generationId: 'generation-1', pageNumber: 2, imageUrl: 'https://assets/page-2.webp', width: 100, height: 150 },
  ],
};

test('translates the Biblioteca manifest and BookReader page events', () => {
  const events: string[] = [];
  const instance = createInstance(events);
  const factory = createFactory(instance, events);
  const renderer = createBookReaderRenderer(factory);
  const target = createTarget();
  let changedPage = 0;

  renderer.mount(target, manifest, (pageNumber) => { changedPage = pageNumber; });

  assert.equal(instance.options.data[0][0].uri, 'https://assets/page-1.webp');
  assert.equal(instance.options.data[1][0].width, 100);
  assert.deepEqual(events, ['bind:pageChanged', 'init']);

  instance.emitPageChanged(1);
  assert.equal(changedPage, 2);
});

test('delegates navigation and cleans up on rerender and destroy', () => {
  const events: string[] = [];
  const first = createInstance(events);
  const second = createInstance(events);
  let call = 0;
  const renderer = createBookReaderRenderer(() => call++ === 0 ? first : second);
  const target = createTarget();

  renderer.mount(target, manifest, () => {});
  renderer.next();
  renderer.previous();
  renderer.goTo(2);
  renderer.mount(target, manifest, () => {});
  renderer.destroy();

  assert.deepEqual(events, [
    'bind:pageChanged', 'init', 'next', 'prev', 'jump:2', 'unbind:pageChanged', 'destroy',
    'bind:pageChanged', 'init', 'unbind:pageChanged', 'destroy',
  ]);
  assert.equal(target.innerHTML, '');
});

test('reports initialization failures through the reader seam', () => {
  const events: string[] = [];
  const renderer = createBookReaderRenderer(() => ({
    ...createInstance(events),
    init() { throw new Error('BookReader failed'); },
  }));
  let failed = false;

  renderer.mount(createTarget(), manifest, () => {}, () => { failed = true; });

  assert.equal(failed, true);
});

function createFactory(instance: BookReaderInstance, events: string[]): BookReaderFactory {
  return (options) => {
    instance.options = options;
    return instance;
  };
}

function createInstance(events: string[]): BookReaderInstance & { emitPageChanged(index: number): void } {
  let pageChanged: ((event: unknown, props: unknown) => void) | undefined;
  return {
    options: {} as BookReaderOptions,
    bind(name, callback) {
      events.push(`bind:${name}`);
      if (name === 'pageChanged') pageChanged = callback;
    },
    unbind(name) { events.push(`unbind:${name}`); },
    init() { events.push('init'); },
    next() { events.push('next'); },
    prev() { events.push('prev'); },
    jumpToPage(pageNumber) { events.push(`jump:${pageNumber}`); },
    destroy() { events.push('destroy'); },
    emitPageChanged(index) { pageChanged?.({}, { currentIndex: () => index }); },
  };
}

function createTarget(): { id: string; innerHTML: string } {
  return {
    id: 'reader-target',
    innerHTML: '',
  };
}

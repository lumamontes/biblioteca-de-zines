import type { ReaderPageManifest } from '@biblioteca-de-zines/reader';
import type { ReaderRenderer } from '@/application/reader-types';
import { getBookReaderFactory, loadBookReaderRuntime } from './bookreader-runtime';
import { createBookReaderOptions, type ReaderViewOptions } from './bookreader-options';
import type { BookReaderFactory, BookReaderInstance } from './bookreader-types';

export type { BookReaderFactory, BookReaderInstance } from './bookreader-types';
export type { ReaderViewOptions } from './bookreader-options';
export { loadBookReaderRuntime } from './bookreader-runtime';

type BookReader = BookReaderInstance;
type Target = HTMLDivElement & { id: string };

export function createBookReaderRenderer(factory?: BookReaderFactory, viewOptions: ReaderViewOptions = {}): ReaderRenderer {
  let instance: BookReader | undefined;
  let target: Target | undefined;
  let resizeHandler: (() => void) | undefined;
  return {
    mount(container, manifest, onPageChanged, onError) {
      cleanupInstance();
      target = container as Target;
      target.id ||= `bookreader-${Math.random().toString(36).slice(2)}`;
      const Constructor = factory ?? getBookReaderFactory();
      instance = new Constructor(createBookReaderOptions(target.id, manifest, viewOptions));
      instance.bind('pageChanged', (...args) => onPageChanged(Number(args[0])));
      instance.bind('error', () => onError?.());
      if (typeof window !== 'undefined' && instance.resize) {
        resizeHandler = () => instance?.resize?.();
        window.addEventListener('resize', resizeHandler);
      }
      try {
        instance.init();
        if (typeof window !== 'undefined') {
          window.requestAnimationFrame(() => {
            try { instance?.resize?.(); } catch { /* BookReader may not be ready for a resize on its first frame. */ }
          });
        }
      } catch (error) { onError?.(); cleanupInstance(); throw error; }
    },
    next: () => instance?.next(),
    previous: () => instance?.prev(),
    goTo: (page) => instance?.jumpToPage(page),
    destroy: () => { cleanupInstance(); if (target) target.replaceChildren(); },
  };

  function cleanupInstance() {
    if (resizeHandler && typeof window !== 'undefined') window.removeEventListener('resize', resizeHandler);
    resizeHandler = undefined;
    instance?.unbind?.('pageChanged');
    instance?.unbind?.('error');
    instance?.destroy?.();
    instance = undefined;
  }
}

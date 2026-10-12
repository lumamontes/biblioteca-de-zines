import type { ReaderPageManifest, ReaderRenderTarget, ReaderRenderer } from '../../application/reader';
import type {
  BookReaderEvent,
  BookReaderFactory,
  BookReaderInstance,
  BookReaderOptions,
} from './bookreader-adapter-types';

type BookReaderTarget = {
  id: string;
  innerHTML: string;
};

let targetSequence = 0;

export function createBookReaderRenderer(factory: BookReaderFactory): ReaderRenderer {
  let instance: BookReaderInstance | undefined;
  let target: BookReaderTarget | undefined;
  let pageChanged: BookReaderEvent | undefined;
  let resize: (() => void) | undefined;

  function destroy() {
    if (instance && pageChanged) instance.unbind('pageChanged', pageChanged);
    if (resize && typeof window !== 'undefined') window.removeEventListener('resize', resize);
    instance?.destroy?.();
    if (target) target.innerHTML = '';
    instance = undefined;
    pageChanged = undefined;
    resize = undefined;
  }

  return {
    mount(renderTarget, manifest, onPageChanged, onError) {
      destroy();
      target = getTarget(renderTarget);
      const options = createOptions(target, manifest);

      try {
        instance = factory(options);
        pageChanged = (_event, props) => {
          const reader = isBookReaderInstance(props) ? props : instance;
          const index = reader?.currentIndex?.() ?? 0;
          onPageChanged(index + 1);
        };
        instance.bind('pageChanged', pageChanged);
        instance.init();
        resize = () => instance?.resize?.();
        if (typeof window !== 'undefined') window.addEventListener('resize', resize);
      } catch {
        destroy();
        onError?.();
      }
    },
    next() {
      instance?.next();
    },
    previous() {
      instance?.prev();
    },
    goTo(pageNumber) {
      instance?.jumpToPage(pageNumber);
    },
    destroy,
  };
}

function createOptions(target: BookReaderTarget, manifest: ReaderPageManifest): BookReaderOptions {
  if (!target.id) target.id = `biblioteca-bookreader-${targetSequence++}`;

  return {
    el: `#${target.id}`,
    data: manifest.pages.map((page) => [{
      width: page.width,
      height: page.height,
      uri: page.imageUrl,
      pageNum: page.pageNumber,
    }]),
    ui: 'responsive',
    showToolbar: true,
    imagesBaseURL: 'https://cdn.jsdelivr.net/npm/@internetarchive/bookreader@5.0.0-87/BookReader/images/',
  };
}

function getTarget(target: ReaderRenderTarget): BookReaderTarget {
  if (!target || typeof target !== 'object' || !('innerHTML' in target) || !('id' in target)) {
    throw new Error('BookReader requires an element render target');
  }
  return target as BookReaderTarget;
}

function isBookReaderInstance(value: unknown): value is BookReaderInstance {
  return Boolean(value && typeof value === 'object' && 'currentIndex' in value);
}

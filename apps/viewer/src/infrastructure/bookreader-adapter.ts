import type { ReaderPageManifest, ReaderRenderer } from '@biblioteca/reader-contracts';

export type BookReaderInstance = { init: () => void; bind: (event: string, callback: (...args: unknown[]) => void) => void; unbind?: (event: string) => void; next: () => void; prev: () => void; jumpToPage: (page: number) => void; resize?: () => void; destroy?: () => void };
export type BookReaderFactory = new (options: unknown) => BookReaderInstance;
type BookReader = BookReaderInstance;
type Target = HTMLDivElement & { id: string };
const BOOKREADER_CDN = 'https://cdn.jsdelivr.net/npm/@internetarchive/bookreader@5.0.0-87/BookReader';
let runtimePromise: Promise<void> | undefined;

declare global {
  interface Window { BookReader?: new (options: unknown) => BookReader; }
}

export async function loadBookReaderRuntime(): Promise<void> {
  if (window.BookReader) return;
  runtimePromise ??= Promise.all([
    loadAsset(`${BOOKREADER_CDN}/BookReader.js`, 'script'),
    loadAsset(`${BOOKREADER_CDN}/BookReader.css`, 'style'),
  ]).then(() => undefined);
  try {
    await runtimePromise;
    if (!window.BookReader) throw new Error('BookReader runtime is unavailable');
  } catch (error) {
    runtimePromise = undefined;
    throw error;
  }
}

export function createBookReaderRenderer(factory?: BookReaderFactory): ReaderRenderer {
  let instance: BookReader | undefined;
  let target: Target | undefined;
  let resizeHandler: (() => void) | undefined;
  return {
    mount(container, manifest, onPageChanged, onError) {
      cleanupInstance();
      target = container as Target;
      target.id ||= `bookreader-${Math.random().toString(36).slice(2)}`;
      const Constructor = factory ?? window.BookReader;
      if (!Constructor) throw new Error('BookReader runtime is unavailable');
      instance = new Constructor({ el: `#${target.id}`, ui: 'responsive', showToolbar: true, data: manifest.pages.map((page) => [{ pageNum: page.pageNumber, uri: page.imageUrl, width: page.width, height: page.height }]) });
      instance.bind('pageChanged', (...args) => onPageChanged(Number(args[0])));
      instance.bind('error', () => onError?.());
      if (typeof window !== 'undefined' && instance.resize) {
        resizeHandler = () => instance?.resize?.();
        window.addEventListener('resize', resizeHandler);
      }
      try { instance.init(); } catch (error) { onError?.(); cleanupInstance(); throw error; }
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

function loadAsset(url: string, kind: 'script' | 'style'): Promise<void> {
  const existing = document.querySelector(`[data-reader-asset="${url}"]`);
  if (existing) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const asset = kind === 'script' ? document.createElement('script') : document.createElement('link');
    if (kind === 'script') {
      asset.setAttribute('src', url);
      (asset as HTMLScriptElement).async = true;
    } else {
      asset.setAttribute('rel', 'stylesheet');
      asset.setAttribute('href', url);
    }
    asset.setAttribute('data-reader-asset', url);
    asset.addEventListener('load', () => resolve(), { once: true });
    asset.addEventListener('error', () => reject(new Error(`Failed to load reader asset: ${url}`)), { once: true });
    document.head.appendChild(asset);
  });
}
